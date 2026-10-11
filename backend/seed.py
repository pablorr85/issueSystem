#!/usr/bin/env python3
"""
DoWork Database Demo Seeding Script
Populates the database with realistic demo data:
- Default Tenant ("DoWork Facilities & Operations")
- Two realistic operators: "Carlos Ruiz" and "Elena Martín" with OperatorProfiles
- 30 diverse maintenance issues with varying priorities and statuses
"""

import os
import sys
import uuid
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

# Set up Django environment
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'issue_system.settings')

import django
django.setup()

from django.conf import settings
settings.CELERY_TASK_ALWAYS_EAGER = True
settings.CELERY_TASK_EAGER_PROPAGATES = True

from django.contrib.auth import get_user_model
from core.models import Tenant, Zone, CustomField, Issue, OperatorProfile, TaskLog

User = get_user_model()


def seed_database():
    print("🚀 Starting DoWork database seeding...")

    # 1. Create or get default demo Tenant
    tenant, created = Tenant.objects.get_or_create(
        name="DoWork Facilities & Operations",
        defaults={
            "visual_config": {
                "primary_color": "#863bff",
                "secondary_color": "#47bfff"
            },
            "default_language": "es",
            "is_public_reporting_enabled": True
        }
    )
    print(f"🏢 Tenant ready: {tenant.name} (ID: {tenant.id})")

    # 2. Setup Zones
    zone_names = [
        "Building A - Technical Plant & HVAC",
        "Building A - Commercial Offices",
        "Building B - Logistics & Loading Dock",
        "Basement - Underground Parking & Pumps",
        "Exterior - Perimeter, Access & Gardens",
        "Server Room & Central Data Center"
    ]
    zones = {}
    for name in zone_names:
        zone, _ = Zone.objects.get_or_create(tenant=tenant, name=name)
        zones[name] = zone

    # 3. Setup Custom Fields for tenant dynamic schema
    custom_fields_spec = [
        {
            "name": "priority",
            "field_type": "select",
            "required": True,
            "options": ["critical", "high", "medium", "low"]
        },
        {
            "name": "trade",
            "field_type": "select",
            "required": True,
            "options": ["Electricity", "HVAC", "Plumbing", "Mechanics", "Carpentry & Locks", "Safety & Fire"]
        },
        {
            "name": "asset_code",
            "field_type": "text",
            "required": False,
            "options": []
        }
    ]
    for spec in custom_fields_spec:
        CustomField.objects.update_or_create(
            tenant=tenant,
            name=spec["name"],
            defaults={
                "field_type": spec["field_type"],
                "required": spec["required"],
                "options": spec["options"]
            }
        )

    # 4. Create Operators: "Carlos Ruiz" and "Elena Martín"
    operators_data = [
        {
            "username": "carlos_ruiz",
            "first_name": "Carlos",
            "last_name": "Ruiz",
            "email": "carlos.ruiz@dowork.app",
            "phone_number": "+34612345678",
            "token": uuid.UUID("11111111-2222-3333-4444-555555555551")
        },
        {
            "username": "elena_martin",
            "first_name": "Elena",
            "last_name": "Martín",
            "email": "elena.martin@dowork.app",
            "phone_number": "+34687654321",
            "token": uuid.UUID("22222222-3333-4444-5555-666666666662")
        }
    ]

    operators = {}
    for op_info in operators_data:
        user, _ = User.objects.get_or_create(
            username=op_info["username"],
            defaults={
                "first_name": op_info["first_name"],
                "last_name": op_info["last_name"],
                "email": op_info["email"],
                "tenant": tenant,
                "is_staff": False
            }
        )
        user.first_name = op_info["first_name"]
        user.last_name = op_info["last_name"]
        user.email = op_info["email"]
        user.tenant = tenant
        user.set_password("dowork2026!")
        user.save()

        profile, _ = OperatorProfile.objects.update_or_create(
            user=user,
            defaults={
                "phone_number": op_info["phone_number"],
                "hub_token": op_info["token"]
            }
        )
        operators[op_info["username"]] = user
        print(f"👷 Operator created/updated: {user.get_full_name()} ({user.username}) - Phone: {profile.phone_number}")

    # 5. Clean existing demo issues for this tenant to allow idempotent re-seeding
    Issue.objects.filter(tenant=tenant).delete()

    now = timezone.now()

    # 6. Define 30 diverse maintenance issues
    issues_definitions = [
        {
            "title": "Main chiller refrigeration circuit pressure drop",
            "description": "Primary compressor circuit A in HVAC Plant 01 shows rapid coolant pressure loss. Requires immediate leak detection and refrigerant recharge.",
            "status": "in_progress",
            "priority": "critical",
            "trade": "HVAC",
            "zone": "Building A - Technical Plant & HVAC",
            "assigned_to": "carlos_ruiz",
            "asset_code": "HVAC-CHL-001",
            "order_index": 1,
            "cost": Decimal("450.00"),
            "hours": Decimal("3.5"),
            "days_ago": 2
        },
        {
            "title": "Emergency exit door panic bar jammed on 2nd Floor",
            "description": "Panic hardware bar latch is stuck in unlocked position, posing a building security violation. Hinge realignment and latch replacement required.",
            "status": "pending",
            "priority": "critical",
            "trade": "Carpentry & Locks",
            "zone": "Building A - Commercial Offices",
            "assigned_to": None,
            "asset_code": "SEC-DR-204",
            "order_index": 2,
            "days_ago": 1
        },
        {
            "title": "Freight elevator #2 door optical sensor misalignment",
            "description": "Safety beam sensor trips intermittently during cargo unloading, holding doors open in error state. Optical reflector clean and re-calibration needed.",
            "status": "qa",
            "priority": "critical",
            "trade": "Mechanics",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": "carlos_ruiz",
            "asset_code": "ELEV-FRT-02",
            "order_index": 3,
            "cost": Decimal("280.00"),
            "hours": Decimal("2.0"),
            "days_ago": 3
        },
        {
            "title": "Server room CRAC-01 primary fan belt snapped",
            "description": "Air intake fan belt broken; redundant unit activated. Ambient server temp elevated to 24°C. High urgency belt replacement required.",
            "status": "resolved",
            "priority": "critical",
            "trade": "HVAC",
            "zone": "Server Room & Central Data Center",
            "assigned_to": "carlos_ruiz",
            "asset_code": "CRAC-DC-01",
            "order_index": 4,
            "cost": Decimal("180.00"),
            "hours": Decimal("1.5"),
            "days_ago": 4
        },
        {
            "title": "Main electrical distribution board thermal anomaly",
            "description": "Infrared inspection detected 88°C on circuit breaker B-12 terminal. Immediate torque tightening and contact inspection needed before peak load.",
            "status": "in_progress",
            "priority": "critical",
            "trade": "Electricity",
            "zone": "Building A - Technical Plant & HVAC",
            "assigned_to": "carlos_ruiz",
            "asset_code": "ELEC-MDB-01",
            "order_index": 5,
            "cost": Decimal("320.00"),
            "hours": Decimal("2.5"),
            "days_ago": 1
        },
        {
            "title": "Water supply main pipe leak in basement pump room",
            "description": "High pressure pipe flange dripping heavily onto foundation slab. Isolating valve turned partially to reduce spray.",
            "status": "resolved",
            "priority": "high",
            "trade": "Plumbing",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": "elena_martin",
            "asset_code": "PLMB-PMP-03",
            "order_index": 6,
            "cost": Decimal("210.00"),
            "hours": Decimal("3.0"),
            "days_ago": 5
        },
        {
            "title": "Loading bay hydraulic dock leveler failing to raise",
            "description": "Dock bay 3 hydraulic cylinder leaking fluid; ramp unable to bridge standard trailer height for delivery trucks.",
            "status": "pending",
            "priority": "high",
            "trade": "Mechanics",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": None,
            "asset_code": "DK-LVL-03",
            "order_index": 7,
            "days_ago": 2
        },
        {
            "title": "Automatic fire sprinkler riser pressure switch fault",
            "description": "Monitoring panel receives intermittent low-pressure supervisory alarm on Zone 4 wet pipe riser. Inspect pressure gauge and transducer.",
            "status": "in_progress",
            "priority": "high",
            "trade": "Safety & Fire",
            "zone": "Building A - Technical Plant & HVAC",
            "assigned_to": "elena_martin",
            "asset_code": "FIRE-SPR-04",
            "order_index": 8,
            "cost": Decimal("150.00"),
            "hours": Decimal("1.5"),
            "days_ago": 2
        },
        {
            "title": "Perimeter security gate motorized sliding motor grinding",
            "description": "Drive chain tensioner loose causing metal scraping noise and slow opening cycle during morning employee ingress.",
            "status": "qa",
            "priority": "high",
            "trade": "Mechanics",
            "zone": "Exterior - Perimeter, Access & Gardens",
            "assigned_to": "carlos_ruiz",
            "asset_code": "GATE-EXT-01",
            "order_index": 9,
            "cost": Decimal("195.00"),
            "hours": Decimal("2.0"),
            "days_ago": 3
        },
        {
            "title": "Roof storm drainage gutter overflow during rain",
            "description": "Debris and leaves blocking primary downspout inlet above Building B northwest corner, creating localized pooling on membrane.",
            "status": "resolved",
            "priority": "high",
            "trade": "Plumbing",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": "elena_martin",
            "asset_code": "ROOF-DRN-02",
            "order_index": 10,
            "cost": Decimal("120.00"),
            "hours": Decimal("2.0"),
            "days_ago": 6
        },
        {
            "title": "Cafeteria commercial grease trap pump failure",
            "description": "Grease separator secondary pump tripped on thermal overload. Kitchen drainage backing up; replacement capacitor pending delivery.",
            "status": "blocked",
            "priority": "high",
            "trade": "Plumbing",
            "zone": "Building A - Commercial Offices",
            "assigned_to": "elena_martin",
            "asset_code": "PLMB-GRS-01",
            "order_index": 11,
            "days_ago": 4
        },
        {
            "title": "Backup diesel generator block heater malfunction",
            "description": "Coolant temperature below optimal standby threshold (28°C instead of 45°C). Verify resistance element and 230V auxiliary circuit.",
            "status": "in_progress",
            "priority": "high",
            "trade": "Electricity",
            "zone": "Building A - Technical Plant & HVAC",
            "assigned_to": "carlos_ruiz",
            "asset_code": "GEN-DSL-01",
            "order_index": 12,
            "cost": Decimal("140.00"),
            "hours": Decimal("1.0"),
            "days_ago": 1
        },
        {
            "title": "Main reception automated revolving door sensor dead zone",
            "description": "Inbound slow-down presence sensor fails to detect pedestrians with dark clothing, causing abrupt halts.",
            "status": "pending",
            "priority": "high",
            "trade": "Mechanics",
            "zone": "Building A - Commercial Offices",
            "assigned_to": None,
            "asset_code": "DOOR-REV-01",
            "order_index": 13,
            "days_ago": 2
        },
        {
            "title": "Underground parking sumps dual bilge pump controller error",
            "description": "Alternator relay failed to rotate duty pump on cycle count. Pump #1 running continuously; controller logic reset required.",
            "status": "resolved",
            "priority": "high",
            "trade": "Plumbing",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": "elena_martin",
            "asset_code": "PUMP-SMP-01",
            "order_index": 14,
            "cost": Decimal("175.00"),
            "hours": Decimal("2.0"),
            "days_ago": 7
        },
        {
            "title": "Solar photovoltaic array inverter string 4 disconnection",
            "description": "Inverter displays ground fault isolation resistance error on rooftop DC combiner box #4. Inspect string connectors.",
            "status": "blocked",
            "priority": "medium",
            "trade": "Electricity",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": "carlos_ruiz",
            "asset_code": "PV-INV-04",
            "order_index": 15,
            "days_ago": 5
        },
        {
            "title": "Air handling unit AHU-03 filter differential pressure high",
            "description": "Magnehelic gauge indicates 320 Pa across MERV-13 filter bank. Replace pre-filters and final filter elements.",
            "status": "resolved",
            "priority": "medium",
            "trade": "HVAC",
            "zone": "Building A - Technical Plant & HVAC",
            "assigned_to": "elena_martin",
            "asset_code": "AHU-OFF-03",
            "order_index": 16,
            "cost": Decimal("220.00"),
            "hours": Decimal("2.5"),
            "days_ago": 8
        },
        {
            "title": "Parking barrier boom gate LED indicator arm cracked",
            "description": "Exit lane barrier boom suffered impact from delivery van. LED illumination strip detached; fiberglass arm hairline crack.",
            "status": "in_progress",
            "priority": "medium",
            "trade": "Mechanics",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": "elena_martin",
            "asset_code": "BAR-PARK-02",
            "order_index": 17,
            "cost": Decimal("95.00"),
            "hours": Decimal("1.0"),
            "days_ago": 3
        },
        {
            "title": "Commercial water softener brine tank salt encrustation",
            "description": "Salt dome bridge formed above brine water level, preventing proper ion exchange resin regeneration cycle.",
            "status": "resolved",
            "priority": "medium",
            "trade": "Plumbing",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": "elena_martin",
            "asset_code": "WTR-SFT-01",
            "order_index": 18,
            "cost": Decimal("60.00"),
            "hours": Decimal("1.5"),
            "days_ago": 9
        },
        {
            "title": "Exterior pathway pole lighting circuit trip in Garden zone",
            "description": "RCD safety trip on lighting branch 3. Moisture ingress suspected in ground junction box near sprinkler line.",
            "status": "pending",
            "priority": "medium",
            "trade": "Electricity",
            "zone": "Exterior - Perimeter, Access & Gardens",
            "assigned_to": None,
            "asset_code": "LGT-EXT-03",
            "order_index": 19,
            "days_ago": 1
        },
        {
            "title": "Fire damper FD-12 spring release inspection and certification",
            "description": "Annual scheduled drop test and microswitch position verification on Level 2 duct shaft fire damper.",
            "status": "qa",
            "priority": "medium",
            "trade": "Safety & Fire",
            "zone": "Building A - Commercial Offices",
            "assigned_to": "carlos_ruiz",
            "asset_code": "FIRE-DMP-12",
            "order_index": 20,
            "cost": Decimal("110.00"),
            "hours": Decimal("1.5"),
            "days_ago": 4
        },
        {
            "title": "Overhead sectional roll-up door spring tension out of balance",
            "description": "Torsion spring requires 1.5 turns adjustment. Door motor labours significantly during initial ascent.",
            "status": "in_progress",
            "priority": "medium",
            "trade": "Mechanics",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": "carlos_ruiz",
            "asset_code": "DOOR-SEC-01",
            "order_index": 21,
            "cost": Decimal("130.00"),
            "hours": Decimal("2.0"),
            "days_ago": 2
        },
        {
            "title": "Restroom sensor flush valve continuous trickling in East Wing",
            "description": "Solenoid diaphragm valve calcified; water slowly runs continuously into urinal basin #3.",
            "status": "resolved",
            "priority": "low",
            "trade": "Plumbing",
            "zone": "Building A - Commercial Offices",
            "assigned_to": "elena_martin",
            "asset_code": "PLMB-FLS-03",
            "order_index": 22,
            "cost": Decimal("45.00"),
            "hours": Decimal("0.8"),
            "days_ago": 10
        },
        {
            "title": "Underground parking bay fluorescent luminaire ballast hum",
            "description": "Magnetic ballast in aisle D luminaire producing excessive 50Hz hum and noticeable flicker. Convert fitting to LED tube.",
            "status": "resolved",
            "priority": "low",
            "trade": "Electricity",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": "elena_martin",
            "asset_code": "LGT-PKG-14",
            "order_index": 23,
            "cost": Decimal("35.00"),
            "hours": Decimal("0.5"),
            "days_ago": 11
        },
        {
            "title": "Conference room 302 HVAC supply diffuser whistling noise",
            "description": "Volume control damper blade vibrating at airflow velocity above 60%. Damping foam strip installation requested.",
            "status": "wont_fix",
            "priority": "low",
            "trade": "HVAC",
            "zone": "Building A - Commercial Offices",
            "assigned_to": None,
            "asset_code": "HVAC-DIF-302",
            "order_index": 24,
            "days_ago": 14
        },
        {
            "title": "Water fountain bottle filler chilling refrigeration noisy fan",
            "description": "Minor fan bearing vibration on 1st floor water drinking dispenser. Operation nominal; schedule for routine overhaul.",
            "status": "pending",
            "priority": "low",
            "trade": "Mechanics",
            "zone": "Building A - Commercial Offices",
            "assigned_to": None,
            "asset_code": "WTR-FTN-01",
            "order_index": 25,
            "days_ago": 3
        },
        {
            "title": "Archive room obsolete pneumatic thermostat replacement",
            "description": "Old pneumatic thermostat decommissioned. Tenant requested electronic digital sensor during next general floor renovation.",
            "status": "wont_fix",
            "priority": "low",
            "trade": "HVAC",
            "zone": "Building A - Commercial Offices",
            "assigned_to": None,
            "asset_code": "STAT-PNE-09",
            "order_index": 26,
            "days_ago": 20
        },
        {
            "title": "Staff breakroom kitchen cabinet hinge loose",
            "description": "Concealed Euro hinge screws stripped out of particle board carcass under coffee machine counter.",
            "status": "resolved",
            "priority": "low",
            "trade": "Carpentry & Locks",
            "zone": "Building A - Commercial Offices",
            "assigned_to": "elena_martin",
            "asset_code": "CARP-CAB-01",
            "order_index": 27,
            "cost": Decimal("20.00"),
            "hours": Decimal("0.5"),
            "days_ago": 12
        },
        {
            "title": "Basement fire exit tactile floor signage adhesive peeling",
            "description": "Non-slip luminous egress guidance strip peeling up at bottom landing of Stairwell C.",
            "status": "pending",
            "priority": "low",
            "trade": "Safety & Fire",
            "zone": "Basement - Underground Parking & Pumps",
            "assigned_to": None,
            "asset_code": "SIGN-TAC-03",
            "order_index": 28,
            "days_ago": 2
        },
        {
            "title": "Exterior garden irrigation drip line punctual puncture",
            "description": "Gardener spade punctured 16mm polyethylene drip line near southern fence boundary.",
            "status": "qa",
            "priority": "low",
            "trade": "Plumbing",
            "zone": "Exterior - Perimeter, Access & Gardens",
            "assigned_to": "elena_martin",
            "asset_code": "IRR-LINE-05",
            "order_index": 29,
            "cost": Decimal("15.00"),
            "hours": Decimal("0.5"),
            "days_ago": 3
        },
        {
            "title": "Loading bay wall bumper rubber cushion replacement",
            "description": "Heavy-duty rubber loading dock bumper cushion sheared after container contact. Bolt kit replacement needed.",
            "status": "in_progress",
            "priority": "medium",
            "trade": "Mechanics",
            "zone": "Building B - Logistics & Loading Dock",
            "assigned_to": "carlos_ruiz",
            "asset_code": "DK-BMP-02",
            "order_index": 30,
            "cost": Decimal("110.00"),
            "hours": Decimal("1.2"),
            "days_ago": 1
        }
    ]

    print(f"\n📦 Creating {len(issues_definitions)} maintenance issues across statuses and priorities...")

    created_issues = []
    for idx, item in enumerate(issues_definitions, start=1):
        assigned_user = operators.get(item["assigned_to"]) if item["assigned_to"] else None
        zone_obj = zones[item["zone"]]

        created_date = now - timedelta(days=item.get("days_ago", 1))
        
        issue = Issue(
            tenant=tenant,
            order_number=f"WO-{1000 + idx:05d}",
            title=item["title"],
            description=item["description"],
            status=item["status"],
            zone=zone_obj,
            assigned_to=assigned_user,
            order_index=item["order_index"],
            extra_data={
                "priority": item["priority"],
                "trade": item["trade"],
                "asset_code": item["asset_code"]
            },
            total_cost=item.get("cost"),
            total_time_spent_hours=item.get("hours")
        )
        issue._skip_whatsapp = True
        issue.save()
        # Update creation timestamp for historical realism
        Issue.objects.filter(pk=issue.pk).update(created_at=created_date)

        # Create realistic TaskLog if issue is in_progress, qa, or resolved
        if item["status"] in ["in_progress", "qa", "resolved"] and assigned_user:
            profile = getattr(assigned_user, 'operator_profile', None)
            TaskLog.objects.create(
                task=issue,
                text=f"Initial inspection completed by {assigned_user.get_full_name()}. Scope evaluated and work commenced.",
                cost=item.get("cost", Decimal("0.00")),
                time_spent_hours=item.get("hours", Decimal("1.0")),
                author_type='OPERATOR',
                author_user=assigned_user,
                author_operator=profile
            )

        created_issues.append(issue)
        assignee_str = f"-> Assigned to: {assigned_user.get_full_name()}" if assigned_user else "-> Unassigned"
        print(f"  [{issue.order_number}] ({item['priority'].upper():8}) {item['status']:12} | {issue.title[:35]}... {assignee_str}")

    print("\n✅ Successfully seeded DoWork database:")
    print("   • Operators: Carlos Ruiz & Elena Martín with active OperatorProfiles")
    print(f"   • Maintenance Issues: {len(created_issues)} issues across 6 zones, 4 priorities, and 6 lifecycle statuses")
    return tenant, created_issues


if __name__ == '__main__':
    seed_database()
