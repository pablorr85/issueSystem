from rest_framework import serializers
from .models import Tenant, CustomField, Issue

class CustomFieldSerializer(serializers.ModelSerializer):
    """
    Serializer for exposing custom field requirements for a tenant.
    """
    class Meta:
        model = CustomField
        fields = ('name', 'field_type', 'required', 'options')


class TenantConfigSerializer(serializers.ModelSerializer):
    """
    Serializer for exposing tenant configuration and its dynamic custom fields.
    """
    custom_fields = CustomFieldSerializer(many=True, read_only=True)

    class Meta:
        model = Tenant
        fields = ('id', 'name', 'logo_url', 'visual_config', 'custom_fields')


class IssueSerializer(serializers.ModelSerializer):
    """
    Serializer for validation and creation of Issues.
    Validates dynamic extra_data against the Tenant's CustomField schemas.
    """
    tenant_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Issue
        fields = ('id', 'tenant_id', 'status', 'description', 'photo_url', 'extra_data', 'created_at', 'updated_at')
        read_only_fields = ('id', 'status', 'created_at', 'updated_at')

    def validate(self, attrs):
        tenant_id = attrs.get('tenant_id')
        extra_data = attrs.get('extra_data', {})

        # Ensure Tenant exists
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except Tenant.DoesNotExist:
            raise serializers.ValidationError({"tenant_id": "Tenant does not exist."})

        # Fetch custom fields defined for the Tenant
        custom_fields = tenant.custom_fields.all()
        
        # Verify required fields are present in extra_data
        for field in custom_fields:
            if field.required and field.name not in extra_data:
                raise serializers.ValidationError({
                    "extra_data": f"The dynamic field '{field.name}' is required."
                })
        
        # Stash resolved tenant object into validated attributes
        attrs['tenant'] = tenant
        return attrs

    def create(self, validated_data):
        # Remove write_only UUID key and inject resolved object
        validated_data.pop('tenant_id', None)
        return Issue.objects.create(**validated_data)
