from rest_framework import generics
from rest_framework.pagination import PageNumberPagination
from .models import Tenant, Issue
from .serializers import TenantConfigSerializer, IssueSerializer, IssueListSerializer, IssueStatusUpdateSerializer

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
    Optionally filters by tenant_id and status query parameters.
    """
    serializer_class = IssueListSerializer
    pagination_class = IssuePagination

    def get_queryset(self):
        queryset = Issue.objects.all().order_by('-created_at')
        tenant_id = self.request.query_params.get('tenant_id')
        status = self.request.query_params.get('status')
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        if status:
            queryset = queryset.filter(status=status)
        return queryset


class IssueStatusUpdateView(generics.UpdateAPIView):
    """
    API endpoint to update an Issue's status. Accepts PATCH requests.
    """
    queryset = Issue.objects.all()
    serializer_class = IssueStatusUpdateSerializer
    lookup_field = 'pk'
