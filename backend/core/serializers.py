from rest_framework import serializers
from .models import Tenant

class TenantConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for exposing basic Tenant configuration including name,
    logo_url, and visual configuration.
    """
    class Meta:
        model = Tenant
        fields = ('name', 'logo_url', 'visual_config')
