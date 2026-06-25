from rest_framework import serializers
from .models import Tenant, CustomField, Issue, User, IssueComment

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
        fields = ('id', 'name', 'logo_url', 'visual_config', 'custom_fields', 'default_language')


def get_issue_resolved_at(obj):
    if obj.status not in ('resolved', 'wont_fix'):
        return None
    target_suffix = "to resolved" if obj.status == 'resolved' else "to wont fix"
    comment = obj.comments.filter(
        is_system_log=True,
        comment_text__iendswith=target_suffix
    ).order_by('-created_at').first()
    if comment:
        return comment.created_at
    return obj.updated_at


class IssueSerializer(serializers.ModelSerializer):
    """
    Serializer for validation, creation, and update of Issues.
    Validates dynamic extra_data against the Tenant's CustomField schemas.
    """
    tenant_id = serializers.UUIDField(write_only=True, required=False)
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, default='')
    secure_token = serializers.UUIDField(read_only=True)
    extra_data = serializers.JSONField(required=False, default=dict)
    resolved_at = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = (
            'id', 'tenant_id', 'status', 'description', 'photo_url', 'image', 'extra_data',
            'assigned_to', 'assigned_to_name', 'secure_token', 'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = ('id', 'secure_token', 'created_at', 'updated_at', 'resolved_at')

    def get_resolved_at(self, obj):
        return get_issue_resolved_at(obj)

    def validate(self, attrs):
        tenant_id = attrs.get('tenant_id')
        extra_data = attrs.get('extra_data')

        if not tenant_id:
            if self.instance:
                tenant = self.instance.tenant
            else:
                raise serializers.ValidationError({"tenant_id": "This field is required."})
        else:
            try:
                tenant = Tenant.objects.get(id=tenant_id)
            except Tenant.DoesNotExist:
                raise serializers.ValidationError({"tenant_id": "Tenant does not exist."})

        # Validate assigned_to operator is compatible
        assigned_to = attrs.get('assigned_to', None)
        if assigned_to is not None:
            if not hasattr(assigned_to, 'operator_profile'):
                raise serializers.ValidationError({"assigned_to": "Assigned user must be an operator (have an OperatorProfile)."})
            if assigned_to.tenant != tenant:
                raise serializers.ValidationError({"assigned_to": "Assigned operator must belong to the same tenant."})

        if extra_data is None:
            extra_data = self.instance.extra_data if self.instance else {}
            attrs['extra_data'] = extra_data

        # If uploaded via multipart form, extra_data might be a string.
        # Parse it if it is a string.
        if isinstance(extra_data, str):
            try:
                import json
                extra_data = json.loads(extra_data)
                attrs['extra_data'] = extra_data
            except ValueError:
                raise serializers.ValidationError({"extra_data": "Invalid JSON format for extra_data."})

        # Fetch custom fields defined for the Tenant
        custom_fields = tenant.custom_fields.all()
        
        # Verify required fields are present in extra_data
        for field in custom_fields:
            if field.required and field.name not in extra_data:
                raise serializers.ValidationError({
                    "extra_data": f"The dynamic field '{field.name}' is required."
                })
        
        attrs['tenant'] = tenant
        return attrs

    def create(self, validated_data):
        # Remove write_only UUID key and inject resolved object
        validated_data.pop('tenant_id', None)
        return Issue.objects.create(**validated_data)


class IssueListSerializer(serializers.ModelSerializer):
    """
    Serializer for paginated read-only list of issues, exposing the tenant UUID.
    """
    tenant_id = serializers.UUIDField(source='tenant.id', read_only=True)
    assigned_to = serializers.PrimaryKeyRelatedField(read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, default='')
    secure_token = serializers.UUIDField(read_only=True)
    resolved_at = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = (
            'id', 'tenant_id', 'status', 'description', 'photo_url', 'image', 'extra_data',
            'assigned_to', 'assigned_to_name', 'secure_token', 'created_at', 'updated_at', 'resolved_at'
        )

    def get_resolved_at(self, obj):
        return get_issue_resolved_at(obj)


class IssueStatusUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer restricting updates exclusively to the status field.
    """
    class Meta:
        model = Issue
        fields = ('status',)


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='operator_profile.phone_number', read_only=True, default='')
    hub_token = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone_number', 'hub_token')

    def get_hub_token(self, obj):
        if hasattr(obj, 'operator_profile') and obj.operator_profile:
            return obj.operator_profile.hub_token
        return None


class IssueAssignmentSerializer(serializers.ModelSerializer):
    assigned_to = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        allow_null=True,
        required=False
    )

    class Meta:
        model = Issue
        fields = ('assigned_to', 'status')

    def validate_assigned_to(self, value):
        if value is not None:
            # Check if operator has OperatorProfile
            if not hasattr(value, 'operator_profile'):
                raise serializers.ValidationError("Assigned user must be an operator (have an OperatorProfile).")
            # If instance exists, check tenant
            if self.instance and value.tenant != self.instance.tenant:
                raise serializers.ValidationError("Assigned operator must belong to the same tenant.")
        return value



class OperatorTaskSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenant_logo_url = serializers.URLField(source='tenant.logo_url', read_only=True)
    tenant_visual_config = serializers.JSONField(source='tenant.visual_config', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.username', read_only=True, default='')
    operator_hub_token = serializers.SerializerMethodField()
    resolved_at = serializers.SerializerMethodField()

    class Meta:
        model = Issue
        fields = (
            'id', 'status', 'description', 'photo_url', 'image', 'extra_data',
            'assigned_to', 'assigned_to_name', 'secure_token', 'operator_hub_token',
            'tenant_name', 'tenant_logo_url', 'tenant_visual_config',
            'created_at', 'updated_at', 'resolved_at'
        )
        read_only_fields = (
            'id', 'secure_token', 'assigned_to', 'assigned_to_name', 'operator_hub_token',
            'tenant_name', 'tenant_logo_url', 'tenant_visual_config',
            'created_at', 'updated_at', 'resolved_at'
        )

    def get_operator_hub_token(self, obj):
        if obj.assigned_to and hasattr(obj.assigned_to, 'operator_profile'):
            return obj.assigned_to.operator_profile.hub_token
        return None

    def get_resolved_at(self, obj):
        return get_issue_resolved_at(obj)


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer to return tenant_id and username in response.
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        data['tenant_id'] = str(self.user.tenant.id) if self.user.tenant else None
        data['username'] = self.user.username
        return data


class IssueCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = IssueComment
        fields = ('id', 'issue', 'author_name', 'role', 'comment_text', 'is_system_log', 'created_at')
        read_only_fields = ('id', 'issue', 'author_name', 'role', 'is_system_log', 'created_at')

    def get_author_name(self, obj):
        if obj.is_system_log:
            return "System"
        if obj.author_user:
            return obj.author_user.username
        if obj.author_operator:
            return obj.author_operator.user.username
        return "Unknown"

    def get_role(self, obj):
        if obj.is_system_log:
            return "system"
        if obj.author_user:
            return "manager"
        if obj.author_operator:
            return "operator"
        return "unknown"



