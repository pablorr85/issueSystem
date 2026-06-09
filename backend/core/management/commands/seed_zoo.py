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
                },
                'default_language': 'es'
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
