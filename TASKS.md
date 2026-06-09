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

## [ ] Frontend Tasks (React)

- [ ] Create Issue Link: Add a button or link inside the Dashboard panel to allow authenticated users to easily navigate to the issue reporting form.
