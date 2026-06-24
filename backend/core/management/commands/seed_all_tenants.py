import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Tenant, CustomField, Issue, OperatorProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with multiple tenants representing Malls, Schools, Zoos, and Residential properties for Sprint 17 showcase'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Starting comprehensive multi-tenant seeding process...")

        # Definitions of Tenants
        tenants_data = [
            {
                'slug': 'zoo',
                'name': 'Solvo Wild Zoo',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#2e7d32', # Forest Green
                    'secondary_color': '#ffb300'
                },
                'default_language': 'es',
                'custom_fields': [
                    {
                        'name': 'zona_parque',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Restaurante", "Parque Infantil", "Zona Marina", "Tienda de Regalos", "Recinto de Felinos"]
                    },
                    {
                        'name': 'tipo_activo',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Bomba de Agua", "Valla/Seguridad", "TPV/Caja", "Mobiliario", "Climatizador"]
                    },
                    {
                        'name': 'urgencia',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            {"value": "low", "label": "Baja (Estético)"},
                            {"value": "medium", "label": "Media (Mantenimiento)"},
                            {"value": "critical", "label": "CRÍTICA (Riesgo Animales/Público)"}
                        ]
                    }
                ],
                'issues': [
                    {
                        'description': 'La valla exterior de protección en el recinto de felinos presenta una grieta estructural por desgaste.',
                        'status': 'pending',
                        'extra_data': {
                            'zona_parque': 'Recinto de Felinos',
                            'tipo_activo': 'Valla/Seguridad',
                            'urgencia': 'critical'
                        }
                    },
                    {
                        'description': 'El TPV de la Tienda de Regalos no se enciende tras el corte eléctrico programado del lunes.',
                        'status': 'in_progress',
                        'extra_data': {
                            'zona_parque': 'Tienda de Regalos',
                            'tipo_activo': 'TPV/Caja',
                            'urgencia': 'medium'
                        }
                    }
                ],
                'operator_username': 'zoo_operator',
                'operator_phone': '+34600111111',
                'hub_token': '11111111-1111-1111-1111-111111111111'
            },
            {
                'slug': 'mall',
                'name': 'Plaza Premium Shopping Mall',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#1565c0', # Premium Blue
                    'secondary_color': '#9c27b0' # Violet
                },
                'default_language': 'en',
                'custom_fields': [
                    {
                        'name': 'planta_centro',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Planta Baja", "Primera Planta", "Segunda Planta", "Aparcamiento Subterráneo"]
                    },
                    {
                        'name': 'local_comercial',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Zara", "H&M", "Zona de Restauración", "Baños Comunes", "Pasillo Central"]
                    },
                    {
                        'name': 'categoria_averia',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Electricidad", "Limpieza/Aseo", "Climatización", "Ascensor/Escaleras"]
                    },
                    {
                        'name': 'urgencia',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            {"value": "low", "label": "Low priority (Minor fix)"},
                            {"value": "medium", "label": "Medium priority (Operational)"},
                            {"value": "critical", "label": "CRITICAL (Safety/Closure risk)"}
                        ]
                    }
                ],
                'issues': [
                    {
                        'description': 'Water leak in the public toilets on the ground floor next to H&M, causing slippery floor hazard.',
                        'status': 'pending',
                        'extra_data': {
                            'planta_centro': 'Planta Baja',
                            'local_comercial': 'Baños Comunes',
                            'categoria_averia': 'Limpieza/Aseo',
                            'urgencia': 'critical'
                        }
                    },
                    {
                        'description': 'Main panoramic elevator in Section B is making loud mechanical grinding noises during descent.',
                        'status': 'blocked',
                        'extra_data': {
                            'planta_centro': 'Primera Planta',
                            'local_comercial': 'Pasillo Central',
                            'categoria_averia': 'Ascensor/Escaleras',
                            'urgencia': 'medium'
                        }
                    }
                ],
                'operator_username': 'mall_operator',
                'operator_phone': '+34600222222',
                'hub_token': '22222222-2222-2222-2222-222222222222'
            },
            {
                'slug': 'school',
                'name': 'Bright Future Academy',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#c62828', # Academic Deep Red
                    'secondary_color': '#0d47a1' # Royal Blue
                },
                'default_language': 'es',
                'custom_fields': [
                    {
                        'name': 'edificio',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Pabellón A (Primaria)", "Pabellón B (Secundaria)", "Polideportivo", "Comedor", "Biblioteca"]
                    },
                    {
                        'name': 'aula_instalacion',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Aula 101", "Aula 204", "Gimnasio", "Sala de Profesores", "Patios Exteriores"]
                    },
                    {
                        'name': 'tipo_problema',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Calefacción/AC", "Fuga de Agua", "Bombilla/Luz", "Pizarra/Proyector"]
                    },
                    {
                        'name': 'urgencia',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            {"value": "low", "label": "Baja (Interrupción mínima)"},
                            {"value": "medium", "label": "Media (Afecta clase)"},
                            {"value": "critical", "label": "CRÍTICA (Suspensión de clase)"}
                        ]
                    }
                ],
                'issues': [
                    {
                        'description': 'La calefacción del Pabellón B en el Aula 204 no funciona, temperatura ambiente de 14 grados.',
                        'status': 'pending',
                        'extra_data': {
                            'edificio': 'Pabellón B (Secundaria)',
                            'aula_instalacion': 'Aula 204',
                            'tipo_problema': 'Calefacción/AC',
                            'urgencia': 'critical'
                        }
                    },
                    {
                        'description': 'El proyector interactivo del Pabellón A en la Biblioteca parpadea constantemente e impide ver la pantalla.',
                        'status': 'resolved',
                        'extra_data': {
                            'edificio': 'Biblioteca',
                            'aula_instalacion': 'Sala de Profesores',
                            'tipo_problema': 'Pizarra/Proyector',
                            'urgencia': 'low'
                        }
                    }
                ],
                'operator_username': 'school_operator',
                'operator_phone': '+34600333333',
                'hub_token': '33333333-3333-3333-3333-333333333333'
            },
            {
                'slug': 'residential',
                'name': 'Park Heights Residence',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#37474f', # Steel Slate Grey
                    'secondary_color': '#00acc1' # Cool Teal
                },
                'default_language': 'en',
                'custom_fields': [
                    {
                        'name': 'bloque_comunidad',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Portal 1", "Portal 2", "Portal 3", "Garaje Común", "Jardines y Piscina"]
                    },
                    {
                        'name': 'piso_puerta',
                        'field_type': 'text',
                        'required': False,
                        'options': []
                    },
                    {
                        'name': 'elemento_comun',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Ascensor", "Puerta de Garaje", "Portero Automático", "Alumbrado", "Jardinería"]
                    },
                    {
                        'name': 'urgencia',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            {"value": "low", "label": "Low (Aesthetic/Amenity)"},
                            {"value": "medium", "label": "Medium (Common area issue)"},
                            {"value": "critical", "label": "CRITICAL (Security/Access block)"}
                        ]
                    }
                ],
                'issues': [
                    {
                        'description': 'The automatic rolling gate of the main communal garage is blocked and does not respond to remotes.',
                        'status': 'in_progress',
                        'extra_data': {
                            'bloque_comunidad': 'Garaje Común',
                            'piso_puerta': 'Sótano -1',
                            'elemento_comun': 'Puerta de Garaje',
                            'urgencia': 'critical'
                        }
                    },
                    {
                        'description': 'Fluorescent light tube is flickering and buzzing on the landing of Portal 2, 3rd floor.',
                        'status': 'pending',
                        'extra_data': {
                            'bloque_comunidad': 'Portal 2',
                            'piso_puerta': 'Floor 3',
                            'elemento_comun': 'Alumbrado',
                            'urgencia': 'low'
                        }
                    }
                ],
                'operator_username': 'residential_operator',
                'operator_phone': '+34600444444',
                'hub_token': '44444444-4444-4444-4444-444444444444'
            }
        ]

        for t_info in tenants_data:
            # Create Tenant
            tenant, t_created = Tenant.objects.get_or_create(
                name=t_info['name'],
                defaults={
                    'visual_config': t_info['visual_config'],
                    'default_language': t_info['default_language']
                }
            )
            action_str = "Created" if t_created else "Found/Updated"
            self.stdout.write(self.style.SUCCESS(f"🏢 {action_str} Tenant: '{tenant.name}' (UUID: {tenant.id})"))

            # Update visual config if already existed
            if not t_created:
                tenant.visual_config = t_info['visual_config']
                tenant.default_language = t_info['default_language']
                tenant.save()

            # Create Custom Fields
            for cf_info in t_info['custom_fields']:
                cf, cf_created = CustomField.objects.update_or_create(
                    tenant=tenant,
                    name=cf_info['name'],
                    defaults={
                        'field_type': cf_info['field_type'],
                        'required': cf_info['required'],
                        'options': cf_info['options']
                    }
                )
                cf_action = "Added" if cf_created else "Updated"
                self.stdout.write(self.style.SUCCESS(f"   ⚙️ {cf_action} CustomField: '{cf.name}'"))

            # Create Operator User
            op_username = t_info['operator_username']
            op_user, user_created = User.objects.get_or_create(
                username=op_username,
                defaults={
                    'tenant': tenant,
                    'email': f"{op_username}@solvo.app",
                    'is_staff': False
                }
            )
            if user_created:
                op_user.set_password('solvopass123')
                op_user.save()
                self.stdout.write(self.style.SUCCESS(f"   👤 Created Operator User: '{op_user.username}'"))
            else:
                op_user.tenant = tenant
                op_user.save()
                self.stdout.write(self.style.SUCCESS(f"   👤 Found Operator User: '{op_user.username}'"))

            # Create/Update Operator Profile with static hub_token
            profile_token = uuid.UUID(t_info['hub_token'])
            profile, prof_created = OperatorProfile.objects.update_or_create(
                user=op_user,
                defaults={
                    'phone_number': t_info['operator_phone'],
                    'hub_token': profile_token
                }
            )
            prof_action = "Created" if prof_created else "Updated"
            self.stdout.write(self.style.SUCCESS(f"   🔑 {prof_action} Operator Profile (Phone: {profile.phone_number}, Token: {profile.hub_token})"))

            # Clear old issues for a clean seeding run and recreate them
            Issue.objects.filter(tenant=tenant).delete()
            for issue_info in t_info['issues']:
                issue = Issue.objects.create(
                    tenant=tenant,
                    description=issue_info['description'],
                    status=issue_info['status'],
                    extra_data=issue_info['extra_data'],
                    assigned_to=op_user
                )
                self.stdout.write(self.style.SUCCESS(f"      📌 Created Issue #{issue.id} - '{issue.status}'"))

        self.stdout.write(self.style.SUCCESS("\n✨ Successfully seeded all 4 Corporate Identity Tenants and mock tasks!"))
