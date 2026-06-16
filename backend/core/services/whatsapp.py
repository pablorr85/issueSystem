import os
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# Mock registry to capture sent messages during tests
WHATSAPP_MOCK_REGISTRY = []

def send_whatsapp_message(to_number, message_text):
    """
    Sends a WhatsApp message using Meta's WhatsApp Cloud API.
    If credentials are not present or if running in test context, falls back to Mock Mode and logs the message.
    """
    import sys
    is_testing = 'test' in sys.argv or getattr(settings, 'TESTING', False)

    if is_testing:
        phone_number_id = None
        access_token = None
    else:
        phone_number_id = getattr(settings, 'WHATSAPP_PHONE_NUMBER_ID', None) or os.getenv('WHATSAPP_PHONE_NUMBER_ID')
        access_token = getattr(settings, 'WHATSAPP_ACCESS_TOKEN', None) or os.getenv('WHATSAPP_ACCESS_TOKEN')

    if not phone_number_id or not access_token:
        # Mock Mode
        mock_msg = (
            f"\n--- [META WHATSAPP MOCK] ---\n"
            f"To: {to_number}\n"
            f"Message: {message_text}\n"
            f"----------------------------"
        )
        logger.info(mock_msg)
        print(mock_msg)  # Force output to stdout so it shows up in general console logs
        WHATSAPP_MOCK_REGISTRY.append({
            'to': to_number,
            'body': message_text,
            'status': 'sent_mock'
        })
        return True

    url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to_number,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": message_text
        }
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code in [200, 201]:
            success_msg = f"Meta WhatsApp message sent successfully to {to_number}"
            logger.info(success_msg)
            print(success_msg)
            WHATSAPP_MOCK_REGISTRY.append({
                'to': to_number,
                'body': message_text,
                'status': 'sent_live',
                'response': response.json()
            })
            return True
        else:
            fail_msg = f"Failed to send Meta WhatsApp message. Status: {response.status_code}, Response: {response.text}"
            logger.error(fail_msg)
            print(fail_msg)
            WHATSAPP_MOCK_REGISTRY.append({
                'to': to_number,
                'body': message_text,
                'status': 'failed',
                'error': response.text
            })
            return False
    except Exception as e:
        err_msg = f"Exception raised when calling Meta WhatsApp API: {e}"
        logger.error(err_msg)
        print(err_msg)
        WHATSAPP_MOCK_REGISTRY.append({
            'to': to_number,
            'body': message_text,
            'status': 'failed',
            'error': str(e)
        })
        return False
