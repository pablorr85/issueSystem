from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Tenant, Issue, User, OperatorProfile, IssueComment
from .serializers import (
    TenantConfigSerializer,
    IssueSerializer,
    IssueListSerializer,
    IssueStatusUpdateSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    IssueAssignmentSerializer,
    OperatorTaskSerializer,
    IssueCommentSerializer,
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
        queryset = Issue.objects.filter(tenant=user.tenant).order_by('order_index', '-created_at')
        
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


from rest_framework.exceptions import AuthenticationFailed, PermissionDenied, NotFound
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


class IssueReorderView(APIView):
    """
    API endpoint that allows tenant managers to reorder/prioritize issues.
    Accepts a POST request with an ordered list of issue IDs.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        ordered_ids = request.data.get('ordered_ids')
        if not isinstance(ordered_ids, list):
            return Response({"detail": "ordered_ids must be a list of integers."}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant = request.user.tenant
        issues = Issue.objects.filter(tenant=tenant, id__in=ordered_ids)
        issues_dict = {issue.id: issue for issue in issues}

        for issue_id in ordered_ids:
            if issue_id not in issues_dict:
                return Response({"detail": f"Issue #{issue_id} does not exist or does not belong to this tenant."}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            for index, issue_id in enumerate(ordered_ids):
                issue = issues_dict[issue_id]
                issue.order_index = index
                issue.save(update_fields=['order_index'])

        return Response({"status": "success"}, status=status.HTTP_200_OK)


class IssueCommentsView(generics.ListCreateAPIView):
    """
    API view to list comments and add comments to a specific Issue.
    Supports JWT authorization for managers and token-based checks for field operators.
    """
    serializer_class = IssueCommentSerializer
    permission_classes = []  # Controlled manually in get_queryset/perform_create

    def get_issue(self):
        issue_id = self.kwargs.get('issue_id')
        try:
            return Issue.objects.get(pk=issue_id)
        except (Issue.DoesNotExist, ValueError):
            raise NotFound("Issue not found.")

    def get_queryset(self):
        issue = self.get_issue()
        request = self.request
        token_str = request.query_params.get('token') or request.headers.get('X-Hub-Token')

        # 1. JWT authentication for managers/employees
        if request.user and request.user.is_authenticated:
            if request.user.tenant != issue.tenant:
                raise PermissionDenied("You do not have permission to access comments for this issue.")
            return issue.comments.all().order_by('created_at')

        # 2. Token-based authentication for operators
        if token_str:
            # Secure task token
            try:
                task_token = uuid.UUID(token_str)
                if issue.secure_token == task_token:
                    return issue.comments.all().order_by('created_at')
            except ValueError:
                pass

            # Operator hub token
            try:
                hub_token = uuid.UUID(token_str)
                profile = OperatorProfile.objects.get(hub_token=hub_token)
                if issue.assigned_to == profile.user:
                    return issue.comments.all().order_by('created_at')
            except (OperatorProfile.DoesNotExist, ValueError):
                pass

        raise PermissionDenied("Unauthorized access to comments.")

    def perform_create(self, serializer):
        issue = self.get_issue()
        request = self.request
        token_str = request.query_params.get('token') or request.headers.get('X-Hub-Token')

        author_user = None
        author_operator = None

        # 1. JWT auth user
        if request.user and request.user.is_authenticated:
            if request.user.tenant != issue.tenant:
                raise PermissionDenied("You do not have permission to comment on this issue.")
            author_user = request.user
        
        # 2. Token auth
        elif token_str:
            # Secure task token
            try:
                task_token = uuid.UUID(token_str)
                if issue.secure_token == task_token:
                    if issue.assigned_to:
                        try:
                            author_operator = issue.assigned_to.operator_profile
                        except OperatorProfile.DoesNotExist:
                            pass
            except ValueError:
                pass

            # Operator hub token
            if not author_operator:
                try:
                    hub_token = uuid.UUID(token_str)
                    profile = OperatorProfile.objects.get(hub_token=hub_token)
                    if issue.assigned_to == profile.user:
                        author_operator = profile
                except (OperatorProfile.DoesNotExist, ValueError):
                    pass

        if not author_user and not author_operator:
            raise PermissionDenied("Unauthorized to comment on this issue.")

        serializer.save(
            issue=issue,
            author_user=author_user,
            author_operator=author_operator,
            is_system_log=False
        )






