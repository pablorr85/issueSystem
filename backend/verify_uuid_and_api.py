import os
import sys
import django

# Add backend root to python path
sys.path.append("/Users/pablorodriguezreina/proyectos/issueSystem/backend")

# Set up django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'issue_system.settings')
django.setup()

# Allow testserver host for Client testing
from django.conf import settings
if 'testserver' not in settings.ALLOWED_HOSTS:
    settings.ALLOWED_HOSTS.append('testserver')

from core.models import Tenant
from django.test import Client

# Ensure we have a clean DB state or create a test tenant
tenant, created = Tenant.objects.get_or_create(
    name="Parque de Atracciones",
    defaults={
        "logo_url": "https://example.com/logo.png",
        "visual_config": {
            "primary_color": "#FF5733",
            "secondary_color": "#33FF57"
        }
    }
)

print(f"Tenant: {tenant.name}")
print(f"Tenant UUID: {tenant.id} (Type: {type(tenant.id)})")
print(f"Logo URL: {tenant.logo_url}")
print(f"Visual Config: {tenant.visual_config}")

# Test the API client
client = Client()
url = f"/api/tenant/{tenant.id}/config/"
response = client.get(url)

print(f"GET {url} response status: {response.status_code}")
print(f"Response data: {response.json()}")

assert response.status_code == 200
assert response.json()["name"] == "Parque de Atracciones"
assert response.json()["logo_url"] == "https://example.com/logo.png"
assert response.json()["visual_config"]["primary_color"] == "#FF5733"

print("Backend verification SUCCESSful!")
