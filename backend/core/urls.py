from django.urls import path
from .views import TenantConfigView

urlpatterns = [
    path('tenant/<uuid:id>/config/', TenantConfigView.as_view(), name='tenant-config'),
]
