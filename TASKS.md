# TASK 1: Create Database Seeder for MVP Demo

## 🎯 Objective

Create a Django management command to automatically populate the database with a realistic "Theme Park / Zoo" Tenant and its highly specific dynamic schema (`CustomFields`). This mock data is crucial for the upcoming stakeholder demo.

## [x] Backend Tasks (Django)

- [x] **Directory Structure:** Inside the `backend/core/` application, create the following directory structure if it doesn't exist: `management/commands/`. Ensure both directories contain an `__init__.py` file.
- [x] **Command Creation:** Create a file named `seed_zoo.py` inside `management/commands/`.
- [x] **Implementation:** Implement the `BaseCommand` to create the Tenant and CustomFields. Use the exact script provided below.
- [x] **Execution:** Run the command in the terminal via `python manage.py seed_zoo`.

## 📜 Code for `seed_zoo.py`

```python
from django.core.management.base import BaseCommand
from core.models import Tenant, CustomField

class Command(BaseCommand):
    help = 'Seeds the database with initial Theme Park / Zoo mock data for MVP demonstration'

    def handle(self, *args, **kwargs):
        # 1. Create the Theme Park Tenant
        tenant, created = Tenant.objects.get_or_create(
            name="Wild Park MVP",
            defaults={
                'visual_config': {
                    'primary_color': '#2e7d32', # Forest Green
                    'secondary_color': '#ffb300'
                }
            }
        )

        if created:
            self.stdout.write(self.style.SUCCESS(f"✅ Successfully created Tenant: '{tenant.name}' (UUID: {tenant.id})"))
        else:
            self.stdout.write(self.style.WARNING(f"⚠️ Tenant '{tenant.name}' already exists. (UUID: {tenant.id})"))

        # 2. Define the Custom Fields specific to this Park's operations
        custom_fields_data = [
            {
                'name': 'zona_parque',
                'field_type': 'select',
                'required': True,
                'options': ["Restaurante", "Parque Infantil", "Zona Marina", "Tienda de Regalos", "Recintos Exteriores"]
            },
            {
                'name': 'tipo_activo',
                'field_type': 'select',
                'required': True,
                'options': ["Bomba de Agua", "Climatizador", "Depuradora", "Mobiliario", "TPV/Caja", "Valla/Seguridad"]
            },
            {
                'name': 'urgencia',
                'field_type': 'select',
                'required': True,
                'options': ["Baja (Estético)", "Media (Mantenimiento)", "CRÍTICA (Riesgo Animales/Público)"]
            }
        ]

        # 3. Insert Custom Fields
        for field_data in custom_fields_data:
            options = field_data.pop('options', [])

            # Ensure the 'options' field exists in your CustomField model as a JSONField
            # If the IDE hasn't added it yet, it must add `options = models.JSONField(default=list, blank=True)`
            # to the CustomField model in core/models.py and make migrations before running this script.

            cf, cf_created = CustomField.objects.get_or_create(
                tenant=tenant,
                name=field_data['name'],
                defaults={
                    'field_type': field_data['field_type'],
                    'required': field_data['required'],
                    'options': options
                }
            )

            if cf_created:
                self.stdout.write(self.style.SUCCESS(f"   ➕ Added CustomField: '{cf.name}'"))
            else:
                self.stdout.write(self.style.NOTICE(f"   ✔️ CustomField '{cf.name}' already exists."))

        self.stdout.write(self.style.SUCCESS('\n🚀 Seeding process completed successfully!'))
```

## [x] Frontend Tasks (React)

- [x] Create Issue Link: Add a button or link inside the Dashboard panel to allow authenticated users to easily navigate to the issue reporting form.

# TASK 2: Migrate Media Storage to Google Cloud Storage (GCS)

## 🎯 Objective

Update the application's media storage backend to use Google Cloud Storage (GCS) instead of AWS S3. This will unify our infrastructure with existing projects, centralize billing, and maintain a clean, backend-agnostic model structure using Django's built-in storage abstraction.

## [x] Backend Tasks (Django)

- [x] **Dependencies Update:** Remove `boto3` from the project if it was previously added. Install the Google Cloud storage extension by running `pip install django-storages[google]`.
- [x] **Requirements Tracking:** Update the `requirements.txt` file to reflect the new `django-storages` and `google-cloud-storage` dependencies.
- [x] **Settings Configuration (`settings.py`):** Update the `STORAGES` dictionary (Django 4.2+) to set the `default` backend to `'storages.backends.gcloud.GoogleCloudStorage'`. (If using an older Django version, update `DEFAULT_FILE_STORAGE`).
- [x] **Environment Variables:** Add the required GCS variables to `settings.py` (e.g., mapping `GS_BUCKET_NAME` to an environment variable).
- [x] **Authentication:** Ensure the configuration relies on the standard `GOOGLE_APPLICATION_CREDENTIALS` environment variable to locate the service account JSON, keeping secrets out of the codebase.
- [x] **Model Validation:** Verify that the `ImageField` inside the `Issue` model remains untouched. The field should automatically route file uploads to GCS based solely on the new `settings.py` configuration.

# TASK 3: WhatsApp Service Integration

Please execute the following changes in the Django backend (`core` app):

1. **WhatsApp Service (`core/services/whatsapp.py`):**
   - [x] Create a new service module to handle Meta's WhatsApp Cloud API.
   - [x] Implement a function `send_whatsapp_message(to_number, message_text)`.
   - [x] Use the `requests` library to send a POST request to `https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`.
   - [x] Fetch the `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` securely from environment variables / Django settings.
   - [x] Ensure the payload is formatted correctly for a standard WhatsApp text message and include basic error handling/logging so failed requests don't crash the server.

2. **Notification Trigger Logic:**
   - [x] Update the Issue assignment flow. You can do this by either updating the relevant REST API View/ViewSet (e.g., the `PATCH` or assign endpoint) OR by creating a Django `post_save` signal in `core/signals.py`.
   - [x] **Condition:** The trigger should ONLY fire when an `Issue` transitions from having no operator assigned to having an operator assigned.
   - [x] **Action:** Fetch the assigned operator's phone number.
   - [x] **Message Formulation:** Construct a notification string that includes the issue description and a placeholder "Magic Link" URL (e.g., `http://localhost:5173/work/task/{issue.id}?token=temp_token`).
   - [x] Call the `send_whatsapp_message` function asynchronously or safely handle it so it doesn't block the HTTP response to the frontend.
