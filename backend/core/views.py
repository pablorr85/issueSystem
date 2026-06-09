from rest_framework import generics
from .models import Tenant
from .serializers import TenantConfigSerializer

class TenantConfigView(generics.RetrieveAPIView):
    """
    API endpoint that returns configuration details (name, logo_url, visual_config)
    for a specific Tenant identified by its UUID.
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantConfigSerializer
    lookup_field = 'id'
