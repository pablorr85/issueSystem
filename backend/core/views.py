from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Tenant, Issue
from .serializers import (
    TenantConfigSerializer,
    IssueSerializer,
    IssueListSerializer,
    IssueStatusUpdateSerializer,
    CustomTokenObtainPairSerializer,
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

