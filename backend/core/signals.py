import sys
import threading
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.conf import settings
from django.utils import timezone
from .models import Issue, IssueComment
from .services.whatsapp import send_whatsapp_message

@receiver(pre_save, sender=Issue)
def issue_pre_save(sender, instance, **kwargs):
    """
    Store the previous assigned_to and status state on the instance before saving to DB
    so we can compare changes in the post_save signal.
    Also automatically update resolved_at if status transitions to/from resolved/wont_fix.
    """
    if instance.pk:
        try:
            old_instance = Issue.objects.get(pk=instance.pk)
            instance._old_assigned_to = old_instance.assigned_to
            instance._old_status = old_instance.status
        except Issue.DoesNotExist:
            instance._old_assigned_to = None
            instance._old_status = None
    else:
        instance._old_assigned_to = None
        instance._old_status = None

    if instance.status in ('resolved', 'wont_fix'):
        if instance._old_status not in ('resolved', 'wont_fix'):
            instance.resolved_at = timezone.now()
    else:
        instance.resolved_at = None

@receiver(post_save, sender=Issue)
def issue_post_save(sender, instance, created, **kwargs):
    """
    Compare the current assigned_to and status states with pre-saved values.
    Trigger Meta WhatsApp notifications, and auto-generate audit logs.
    """
    old_assigned = getattr(instance, '_old_assigned_to', None)
    new_assigned = instance.assigned_to
    
    old_status = getattr(instance, '_old_status', None)
    new_status = instance.status

    # 1. Dispatch WhatsApp notification when transitioning to an operator
    if new_assigned and (old_assigned is None or new_assigned != old_assigned) and not getattr(instance, '_skip_whatsapp', False):
        operator = new_assigned
        phone_number = None
        hub_token = None
        if hasattr(operator, 'operator_profile'):
            phone_number = operator.operator_profile.phone_number
            hub_token = operator.operator_profile.hub_token

        if phone_number:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            from django.core import signing
            signed_token = signing.dumps({"task_id": instance.id, "operator_id": operator.id})
            # Dual-Link Construction: Specific task link + general workload hub link
            task_link = f"{frontend_url}/work/task/{instance.id}?token={signed_token}"
            hub_link = f"{frontend_url}/work/hub?token={hub_token}"

            message_body = (
                f"Hola {operator.username},\n\n"
                f"Se te ha asignado una nueva tarea:\n"
                f"Descripción: {instance.description}\n\n"
                f"Puedes acceder a la tarea aquí:\n"
                f"{task_link}\n\n"
                f"O ver todo tu trabajo pendiente en tu panel:\n"
                f"{hub_link}"
            )

            # Asynchronous in dev/production, synchronous in test execution to avoid race conditions
            is_testing = 'test' in sys.argv or getattr(settings, 'TESTING', False)

            if is_testing:
                send_whatsapp_message(phone_number, message_body)
            else:
                thread = threading.Thread(target=send_whatsapp_message, args=(phone_number, message_body))
                thread.daemon = True
                thread.start()

    # 2. System audit logs for comment timeline
    if not created:
        comments_to_create = []

        if old_assigned != new_assigned:
            old_name = old_assigned.username if old_assigned else "Unassigned"
            new_name = new_assigned.username if new_assigned else "Unassigned"
            comments_to_create.append(IssueComment(
                issue=instance,
                comment_text=f"Task reassigned from {old_name} to {new_name}",
                is_system_log=True
            ))

        if old_status != new_status:
            old_status_disp = old_status.replace('_', ' ').capitalize() if old_status else "Unknown"
            new_status_disp = new_status.replace('_', ' ').capitalize()
            comments_to_create.append(IssueComment(
                issue=instance,
                comment_text=f"Status changed from {old_status_disp} to {new_status_disp}",
                is_system_log=True
            ))

        if comments_to_create:
            IssueComment.objects.bulk_create(comments_to_create)
