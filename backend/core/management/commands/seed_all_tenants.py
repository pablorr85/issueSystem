import uuid
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Tenant, CustomField, Issue, OperatorProfile, Zone

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic multi-tenant data, Spanish operators, rich issues, and demo images for DoWork launch'

    def handle(self, *args, **kwargs):
        self.stdout.write("🌱 Iniciando sembrado completo de datos de demostración en español para DoWork...")

        # Definition of Tenants & Operators
        tenants_data = [
            {
                'slug': 'plaza',
                'name': 'DoWork Plaza Central - Centro Comercial & Servicios',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#863bff', # DoWork Purple
                    'secondary_color': '#47bfff'  # DoWork Cyan
                },
                'default_language': 'es',
                'custom_fields': [
                    {
                        'name': 'zona_instalacion',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            "Planta Baja - Aseos Públicos",
                            "Planta 1 - Locales Comerciales",
                            "Aparcamiento Subterráneo",
                            "Zona de Restauración",
                            "Accesos Exteriores y Fachada",
                            "Zonas Técnicas y Almacén"
                        ]
                    },
                    {
                        'name': 'tipo_gremio',
                        'field_type': 'select',
                        'required': True,
                        'options': ["Fontanería", "Electricidad", "Limpieza y Desinfección", "Climatización (HVAC)", "Cerrajería y Cristalería"]
                    },
                    {
                        'name': 'nivel_urgencia',
                        'field_type': 'select',
                        'required': True,
                        'options': [
                            {"value": "baja", "label": "🟢 Baja (Mantenimiento Rutinario)"},
                            {"value": "media", "label": "🟡 Media (Reparación Necesaria)"},
                            {"value": "alta", "label": "🟠 Alta (Interrumpe Servicio)"},
                            {"value": "critica", "label": "🔴 CRÍTICA (Riesgo de Seguridad / Daños)"}
                        ]
                    }
                ],
                'operators': [
                    {
                        'username': 'carlos_garcia',
                        'first_name': 'Carlos',
                        'last_name': 'García',
                        'email': 'carlos.garcia@dowork.app',
                        'phone': '+34611223344',
                        'token': '11111111-1111-1111-1111-111111111111'
                    },
                    {
                        'username': 'maria_fernandez',
                        'first_name': 'María',
                        'last_name': 'Fernández',
                        'email': 'maria.fernandez@dowork.app',
                        'phone': '+34622334455',
                        'token': '22222222-2222-2222-2222-222222222222'
                    },
                    {
                        'username': 'juan_rodriguez',
                        'first_name': 'Juan',
                        'last_name': 'Rodríguez',
                        'email': 'juan.rodriguez@dowork.app',
                        'phone': '+34633445566',
                        'token': '33333333-3333-3333-3333-333333333333'
                    }
                ],
                'issues': [
                    {
                        'title': 'Fuga de agua bajo fregadero en aseos principales',
                        'description': 'Rotura en la junta de desagüe del lavabo central en el aseo de caballeros de la Planta Baja. Goteo constante afectando al suelo.',
                        'status': 'pending',
                        'photo_url': '/demo/fuga_agua.jpg',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Planta Baja - Aseos Públicos',
                            'tipo_gremio': 'Fontanería',
                            'nivel_urgencia': 'alta'
                        }
                    },
                    {
                        'title': 'Avería en cuadro eléctrico de iluminación general',
                        'description': 'Salto intempestivo del magnetotérmico principal en la sección B. Revisar derivación a tierra y cableado quemado.',
                        'status': 'in_progress',
                        'photo_url': '/demo/cuadro_electrico.jpg',
                        'assigned_operator': 'maria_fernandez',
                        'extra_data': {
                            'zona_instalacion': 'Zonas Técnicas y Almacén',
                            'tipo_gremio': 'Electricidad',
                            'nivel_urgencia': 'critica'
                        }
                    },
                    {
                        'title': 'Filtro de climatizador (HVAC) atascado',
                        'description': 'El cassette de aire acondicionado emite ruido excesivo y flujo de aire reducido por acumulación de polvo en rejilla.',
                        'status': 'blocked',
                        'photo_url': '/demo/aire_acondicionado.jpg',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Planta 1 - Locales Comerciales',
                            'tipo_gremio': 'Climatización (HVAC)',
                            'nivel_urgencia': 'media'
                        }
                    },
                    {
                        'title': 'Cerradura atascada en puerta de acceso a almacén B',
                        'description': 'El resbalón del cerrojo de seguridad no retrocede al girar la llave. El personal de limpieza no puede acceder.',
                        'status': 'pending',
                        'photo_url': '',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Zonas Técnicas y Almacén',
                            'tipo_gremio': 'Cerrajería y Cristalería',
                            'nivel_urgencia': 'alta'
                        }
                    },
                    {
                        'title': 'Sustitución de luminarias parpadeando en garaje',
                        'description': 'Sustituir 4 tubos LED agotados en el pasillo central del Aparcamiento Subterráneo (Plaza 45 a 49).',
                        'status': 'resolved',
                        'photo_url': '/demo/cuadro_electrico.jpg',
                        'assigned_operator': 'maria_fernandez',
                        'extra_data': {
                            'zona_instalacion': 'Aparcamiento Subterráneo',
                            'tipo_gremio': 'Electricidad',
                            'nivel_urgencia': 'baja'
                        }
                    },
                    {
                        'title': 'Desinfección y limpieza tras vertido en zona de restauración',
                        'description': 'Limpieza inmediata requerida tras caída de contenedor de aceite en el suelo junto a la terraza principal.',
                        'status': 'in_progress',
                        'photo_url': '/demo/fuga_agua.jpg',
                        'assigned_operator': 'maria_fernandez',
                        'extra_data': {
                            'zona_instalacion': 'Zona de Restauración',
                            'tipo_gremio': 'Limpieza y Desinfección',
                            'nivel_urgencia': 'alta'
                        }
                    },
                    {
                        'title': 'Gotera en falso techo de entrada principal',
                        'description': 'Filtración de agua por condensación en el conducto de ventilación sobre las placas del falso techo.',
                        'status': 'blocked',
                        'photo_url': '/demo/fuga_agua.jpg',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Accesos Exteriores y Fachada',
                            'tipo_gremio': 'Fontanería',
                            'nivel_urgencia': 'media'
                        }
                    },
                    {
                        'title': 'Revisión y puesta a punto de sistema contra incendios (BIEs)',
                        'description': 'Inspección semestral de mangueras, manómetros y válvulas de presión en todas las plantas.',
                        'status': 'resolved',
                        'photo_url': '',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Planta 1 - Locales Comerciales',
                            'tipo_gremio': 'Fontanería',
                            'nivel_urgencia': 'alta'
                        }
                    },
                    {
                        'title': 'Mando a distancia de barrera de garaje inoperativo',
                        'description': 'Sustituir pila y resincronizar frecuencia de la barrera de salida norte.',
                        'status': 'wont_fix',
                        'photo_url': '',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Aparcamiento Subterráneo',
                            'tipo_gremio': 'Electricidad',
                            'nivel_urgencia': 'baja'
                        }
                    },
                    {
                        'title': 'Rotura de cristal en ventanal de fachada exterior',
                        'description': 'Fisura en vidrio templado debido al impacto de racha de viento. Asegurar zona y señalizar inmediatamente.',
                        'status': 'pending',
                        'photo_url': '',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Accesos Exteriores y Fachada',
                            'tipo_gremio': 'Cerrajería y Cristalería',
                            'nivel_urgencia': 'critica'
                        }
                    },
                    {
                        'title': 'Goteo en grifería monomando de aseos adaptados',
                        'description': 'Sustitución de cartucho cerámico en grifo de personas con movilidad reducida.',
                        'status': 'resolved',
                        'photo_url': '/demo/fuga_agua.jpg',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Planta Baja - Aseos Públicos',
                            'tipo_gremio': 'Fontanería',
                            'nivel_urgencia': 'media'
                        }
                    },
                    {
                        'title': 'Reparación de pintura por humedad en pasillo secundario',
                        'description': 'Sanear pared con masilla antihumedad y aplicar dos capas de pintura plástica blanca.',
                        'status': 'in_progress',
                        'photo_url': '',
                        'assigned_operator': 'maria_fernandez',
                        'extra_data': {
                            'zona_instalacion': 'Planta 1 - Locales Comerciales',
                            'tipo_gremio': 'Limpieza y Desinfección',
                            'nivel_urgencia': 'baja'
                        }
                    },
                    {
                        'title': 'Sensor automático de secamanos sin respuesta',
                        'description': 'El fotocélula de activación del secador de manos no detecta proximidad.',
                        'status': 'pending',
                        'photo_url': '',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Planta Baja - Aseos Públicos',
                            'tipo_gremio': 'Electricidad',
                            'nivel_urgencia': 'media'
                        }
                    },
                    {
                        'title': 'Mantenimiento de bomba de achique en foso de ascensor',
                        'description': 'Comprobación de boya de nivel y limpieza de sedimentos en bomba sumergible.',
                        'status': 'in_progress',
                        'photo_url': '/demo/cuadro_electrico.jpg',
                        'assigned_operator': 'carlos_garcia',
                        'extra_data': {
                            'zona_instalacion': 'Zonas Técnicas y Almacén',
                            'tipo_gremio': 'Fontanería',
                            'nivel_urgencia': 'alta'
                        }
                    },
                    {
                        'title': 'Papelera metálica exterior desprendida de soporte',
                        'description': 'Volver a anclar taco de expansión al suelo de hormigón en la terraza exterior.',
                        'status': 'resolved',
                        'photo_url': '',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Accesos Exteriores y Fachada',
                            'tipo_gremio': 'Limpieza y Desinfección',
                            'nivel_urgencia': 'baja'
                        }
                    },
                    {
                        'title': 'Revisión anual de unidades condensadoras de climatización',
                        'description': 'Limpieza de serpetines de aluminio y medición de presiones de gas refrigerante R410A.',
                        'status': 'resolved',
                        'photo_url': '/demo/aire_acondicionado.jpg',
                        'assigned_operator': 'juan_rodriguez',
                        'extra_data': {
                            'zona_instalacion': 'Zonas Técnicas y Almacén',
                            'tipo_gremio': 'Climatización (HVAC)',
                            'nivel_urgencia': 'media'
                        }
                    }
                ]
            },
            {
                'slug': 'zoo',
                'name': 'DoWork Wild Zoo',
                'logo_url': '',
                'visual_config': {
                    'primary_color': '#2e7d32',
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
                'operators': [
                    {
                        'username': 'operario_zoo',
                        'first_name': 'Antonio',
                        'last_name': 'López',
                        'email': 'antonio.lopez@dowork.app',
                        'phone': '+34600111111',
                        'token': '11111111-1111-1111-1111-111111111111'
                    }
                ],
                'issues': [
                    {
                        'title': 'Fisura en vallado de seguridad',
                        'description': 'La valla exterior de protección en el recinto de felinos presenta una grieta estructural por desgaste.',
                        'status': 'pending',
                        'photo_url': '/demo/cuadro_electrico.jpg',
                        'assigned_operator': 'operario_zoo',
                        'extra_data': {
                            'zona_parque': 'Recinto de Felinos',
                            'tipo_activo': 'Valla/Seguridad',
                            'urgencia': 'critical'
                        }
                    },
                    {
                        'title': 'TPV sin señal tras corte de luz',
                        'description': 'El TPV de la Tienda de Regalos no se enciende tras el corte eléctrico programado del lunes.',
                        'status': 'in_progress',
                        'photo_url': '',
                        'assigned_operator': 'operario_zoo',
                        'extra_data': {
                            'zona_parque': 'Tienda de Regalos',
                            'tipo_activo': 'TPV/Caja',
                            'urgencia': 'medium'
                        }
                    }
                ]
            }
        ]

        for t_info in tenants_data:
            # Create/Update Tenant
            tenant, t_created = Tenant.objects.get_or_create(
                name=t_info['name'],
                defaults={
                    'visual_config': t_info['visual_config'],
                    'default_language': t_info['default_language']
                }
            )
            action_str = "Creado" if t_created else "Actualizado"
            self.stdout.write(self.style.SUCCESS(f"🏢 {action_str} Tenant: '{tenant.name}' (ID: {tenant.id})"))

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

            # Map Operators
            operator_users = {}
            for op_data in t_info['operators']:
                op_username = op_data['username']
                op_user, user_created = User.objects.get_or_create(
                    username=op_username,
                    defaults={
                        'tenant': tenant,
                        'first_name': op_data['first_name'],
                        'last_name': op_data['last_name'],
                        'email': op_data['email'],
                        'is_staff': False
                    }
                )
                if not user_created:
                    op_user.first_name = op_data['first_name']
                    op_user.last_name = op_data['last_name']
                    op_user.tenant = tenant
                    op_user.save()

                op_user.set_password('doworkpass123')
                op_user.save()

                profile_token = uuid.UUID(op_data['token'])
                profile, prof_created = OperatorProfile.objects.update_or_create(
                    user=op_user,
                    defaults={
                        'phone_number': op_data['phone'],
                        'hub_token': profile_token
                    }
                )
                operator_users[op_username] = op_user
                self.stdout.write(self.style.SUCCESS(f"   👤 Operario preparado: {op_user.first_name} {op_user.last_name} ({op_user.username})"))

            # Clear old issues for a clean seeding run and recreate them
            Issue.objects.filter(tenant=tenant).delete()

            for idx, issue_info in enumerate(t_info['issues'], start=1):
                assigned_username = issue_info.get('assigned_operator')
                assigned_user = operator_users.get(assigned_username) if assigned_username else None

                # Resolve Zone if applicable
                zona_val = issue_info['extra_data'].get('zona_instalacion') or issue_info['extra_data'].get('zona_parque')
                zone_obj = None
                if zona_val:
                    zone_obj, _ = Zone.objects.get_or_create(tenant=tenant, name=str(zona_val))

                issue = Issue.objects.create(
                    tenant=tenant,
                    order_number=f"WO-00{100 + idx}",
                    title=issue_info['title'],
                    description=issue_info['description'],
                    status=issue_info['status'],
                    photo_url=issue_info.get('photo_url', ''),
                    extra_data=issue_info['extra_data'],
                    assigned_to=assigned_user,
                    zone=zone_obj
                )
                self.stdout.write(self.style.SUCCESS(f"      📌 Incidencia #{issue.order_number} ({issue.title[:30]}...) -> Estado: {issue.status}"))

        self.stdout.write(self.style.SUCCESS("\n✨ Sembrado de demostración finalizado con éxito para DoWork!"))
