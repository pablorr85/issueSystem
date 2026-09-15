import logging
from celery import shared_task
from celery.exceptions import MaxRetriesExceededError
from core.services.whatsapp import send_whatsapp_message

logger = logging.getLogger(__name__)
dlq_logger = logging.getLogger('celery.dlq')


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=2,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=60,
)
def send_async_whatsapp_notification(self, phone_number: str, message_body: str) -> bool:
    """
    Celery background worker task to asynchronously send WhatsApp notifications.
    Features automatic retry policy with exponential backoff (2s, 4s, 8s...)
    and Dead-Letter Queue (DLQ) logging upon exhaustion of retries.
    """
    try:
        success = send_whatsapp_message(phone_number, message_body)
        if not success:
            raise RuntimeError(f"send_whatsapp_message returned failure status for recipient: {phone_number}")
        return True
    except Exception as exc:
        logger.warning(
            f"[Celery Worker] Task {self.request.id} failed (Attempt {self.request.retries + 1}/{self.max_retries + 1}). "
            f"Error: {exc}"
        )
        if self.request.retries >= self.max_retries:
            # Dead-Letter Queue (DLQ) Fallback Logging
            dlq_message = {
                'event': 'DLQ_NOTIFICATION_FAILED',
                'task_id': self.request.id,
                'phone_number': phone_number,
                'message_body': message_body,
                'error': str(exc),
                'retries_exhausted': self.request.retries,
            }
            dlq_logger.error(f"DLQ Event: {dlq_message}")
            logger.error(f"[DLQ] Notification delivery permanently failed for {phone_number}: {exc}")
        raise exc
