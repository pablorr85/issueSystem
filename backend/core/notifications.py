import logging
from django.conf import settings
from django.core import signing
from twilio.rest import Client

logger = logging.getLogger(__name__)

# Mock registry to capture sent messages during tests
WHATSAPP_MOCK_REGISTRY = []

def send_whatsapp_task_notification(issue):
    """
    Utility function that sends a WhatsApp notification to an operator
    upon assignment. Uses Twilio API, falling back to a mock logging
    registry if credentials are not configured.
    """
    operator = issue.assigned_to
    if not operator:
        return
        
    phone_number = None
    if hasattr(operator, 'operator_profile'):
        phone_number = operator.operator_profile.phone_number
        
    if not phone_number:
        logger.warning(f"No phone number found for operator {operator.username}. Skipping WhatsApp notification.")
        return

    # Construct magic link pointing to mobile operator task view
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    signed_token = signing.dumps({"task_id": issue.id, "operator_id": operator.id})
    magic_link = f"{frontend_url}/work/task/{signed_token}"

    message_body = (
        f"Hi {operator.username},\n\n"
        f"You have been assigned a new task:\n"
        f"Description: {issue.description}\n"
        f"Access it here: {magic_link}"
    )

    account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    from_number = getattr(settings, 'TWILIO_WHATSAPP_FROM', 'whatsapp:+14155238886')

    if account_sid and auth_token:
        try:
            client = Client(account_sid, auth_token)
            # Ensure number starts with whatsapp: prefix
            to_number = phone_number
            if not to_number.startswith('whatsapp:'):
                to_number = f"whatsapp:{to_number}"
                
            client.messages.create(
                body=message_body,
                from_=from_number,
                to=to_number
            )
            logger.info(f"WhatsApp notification sent successfully to {phone_number}")
            WHATSAPP_MOCK_REGISTRY.append({
                'to': phone_number,
                'body': message_body,
                'status': 'sent_live'
            })
        except Exception as e:
            logger.error(f"Failed to send WhatsApp notification via Twilio: {e}")
    else:
        # Mock mode
        logger.info(
            f"\n--- [WHATSAPP NOTIFICATION MOCK] ---\n"
            f"To: {phone_number}\n"
            f"Body:\n{message_body}\n"
            f"------------------------------------"
        )
        WHATSAPP_MOCK_REGISTRY.append({
            'to': phone_number,
            'body': message_body,
            'status': 'sent_mock'
        })
