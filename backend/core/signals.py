import sys
import threading
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Issue
from .services.whatsapp import send_whatsapp_message

@receiver(pre_save, sender=Issue)
def issue_pre_save(sender, instance, **kwargs):
    """
    Store the previous assigned_to state on the instance before saving to DB
    so we can compare changes in the post_save signal.
    """
    if instance.pk:
        try:
            old_instance = Issue.objects.get(pk=instance.pk)
            instance._old_assigned_to = old_instance.assigned_to
        except Issue.DoesNotExist:
            instance._old_assigned_to = None
    else:
        instance._old_assigned_to = None

@receiver(post_save, sender=Issue)
def issue_post_save(sender, instance, created, **kwargs):
    """
    Compare the current assigned_to state with the pre-saved state.
    Trigger Meta WhatsApp notification when transitioning from no operator to assigned.
    """
    old_assigned = getattr(instance, '_old_assigned_to', None)
    new_assigned = instance.assigned_to

    # Fire when transitioning from no operator, OR when reassigned to a different operator
    if new_assigned and (old_assigned is None or new_assigned != old_assigned):
        operator = new_assigned
        phone_number = None
        hub_token = None
        if hasattr(operator, 'operator_profile'):
            phone_number = operator.operator_profile.phone_number
            hub_token = operator.operator_profile.hub_token

        if phone_number:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
            # Dual-Link Construction: Specific task link + general workload hub link
            task_link = f"{frontend_url}/work/task/{instance.id}?token={instance.secure_token}"
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
