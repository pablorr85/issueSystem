from rest_framework import generics
from .models import Tenant, Issue
from .serializers import TenantConfigSerializer, IssueSerializer

class TenantConfigView(generics.RetrieveAPIView):
    """
    API endpoint that returns configuration details (name, logo_url, visual_config, custom_fields)
    for a specific Tenant identified by its UUID.
    """
    queryset = Tenant.objects.all()
    serializer_class = TenantConfigSerializer
    lookup_field = 'id'


class IssueCreateView(generics.CreateAPIView):
    """
    API endpoint for submitting a new Issue.
    Saves standard inputs and validates/stores extra_data according to the tenant's schema.
    """
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer
