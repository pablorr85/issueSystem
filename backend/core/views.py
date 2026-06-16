from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Tenant, Issue, User, OperatorProfile
from .serializers import (
    TenantConfigSerializer,
    IssueSerializer,
    IssueListSerializer,
    IssueStatusUpdateSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    IssueAssignmentSerializer,
    OperatorTaskSerializer,
)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view to obtain JWT token alongside user's tenant UUID.
    """
    serializer_class = CustomTokenObtainPairSerializer


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
    Validates is_public_reporting_enabled and enforces employee authentication if disabled.
    """
    queryset = Issue.objects.all()
    serializer_class = IssueSerializer

    def post(self, request, *args, **kwargs):
        tenant_id = request.data.get('tenant_id')
        if not tenant_id:
            return Response({"tenant_id": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            tenant = Tenant.objects.get(id=tenant_id)
        except (Tenant.DoesNotExist, ValueError, ValidationError):
            return Response({"tenant_id": "Tenant does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
        # Verify access control settings for this location
        if not tenant.is_public_reporting_enabled:
            # Enforce authentication for employee-only locations
            if not request.user or not request.user.is_authenticated:
                return Response(
                    {"detail": "Employee login required for this location."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            # Verify the authenticated user belongs to the target tenant
            if request.user.tenant != tenant:
                return Response(
                    {"detail": "You do not have permission to report issues for this location."},
                    status=status.HTTP_403_FORBIDDEN
                )
                
        return super().post(request, *args, **kwargs)


class IssuePagination(PageNumberPagination):
    """
    Custom pagination enforcing 20 items per page limit.
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class IssueListView(generics.ListAPIView):
    """
    API endpoint that returns a paginated list of issues.
    Access restricted to authenticated employees of the tenant.
    """
    serializer_class = IssueListSerializer
    pagination_class = IssuePagination
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Enforce multi-tenant data isolation at database level
        user = self.request.user
        queryset = Issue.objects.filter(tenant=user.tenant).order_by('-created_at')
        
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        return queryset


class IssueStatusUpdateView(generics.UpdateAPIView):
    """
    API endpoint to update an Issue's status. Accepts PATCH requests.
    Access restricted to authenticated employees of the tenant.
    """
    serializer_class = IssueStatusUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Restrict mutation permissions to issues belonging to user's tenant
        return Issue.objects.filter(tenant=self.request.user.tenant)


class OperatorListView(generics.ListAPIView):
    """
    API endpoint that returns a list of users who are operators (have OperatorProfile)
    and belong to the tenant of the authenticated administrator user.
    """
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not user.tenant:
            return User.objects.none()
        # Find users with tenant matching user's tenant and having operator_profile
        return User.objects.filter(tenant=user.tenant, operator_profile__isnull=False)


class IssueAssignmentView(generics.UpdateAPIView):
    """
    API endpoint that allows tenant administrators to assign an operator
    and/or change status of an issue.
    """
    serializer_class = IssueAssignmentSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Allow modifying issues belonging to the admin's tenant
        return Issue.objects.filter(tenant=self.request.user.tenant)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}

        # Return the full serialized representation of the updated issue
        response_serializer = IssueListSerializer(instance)
        return Response(response_serializer.data)



class OperatorTaskView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows passwordless access to a specific task (Issue) using its secure UUID token.
    Allows retrieving task details and updating status (e.g. mark as in_progress or resolved).
    """
    queryset = Issue.objects.all()
    serializer_class = OperatorTaskSerializer
    lookup_field = 'secure_token'
    permission_classes = []  # Public access via secure token lookup


from rest_framework.exceptions import AuthenticationFailed
import uuid

class OperatorHubView(generics.ListAPIView):
    """
    API endpoint that returns a list of all active issues (pending, in_progress)
    assigned to a specific operator identified by their hub_token UUID.
    """
    serializer_class = OperatorTaskSerializer
    permission_classes = []  # Public access via secure hub token lookup

    def get_queryset(self):
        token_str = self.request.query_params.get('token')
        if not token_str:
            raise AuthenticationFailed("Missing hub token.")
        try:
            token = uuid.UUID(token_str)
            profile = OperatorProfile.objects.get(hub_token=token)
        except (OperatorProfile.DoesNotExist, ValueError):
            raise AuthenticationFailed("Invalid hub token.")

        # Return active tasks assigned to this operator
        return Issue.objects.filter(
            assigned_to=profile.user,
            status__in=['pending', 'in_progress']
        ).order_by('-created_at')


class IssueUpdateView(generics.RetrieveUpdateAPIView):
    """
    API endpoint that allows retrieving and updating (PATCH/PUT) a specific Issue.
    Access restricted to authenticated employees of the tenant.
    """
    serializer_class = IssueSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        # Enforce multi-tenant data isolation
        return Issue.objects.filter(tenant=self.request.user.tenant)




