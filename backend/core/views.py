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


class IssueStatsView(APIView):
    """
    API endpoint that returns high-level dashboard metrics for a tenant.
    Access restricted to authenticated employees of the tenant.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        tenant = request.user.tenant
        if not tenant:
            return Response({
                'unassigned_count': 0,
                'in_progress_count': 0,
                'blocked_count': 0
            })
        
        issues = Issue.objects.filter(tenant=tenant)
        unassigned = issues.filter(assigned_to__isnull=True).exclude(status__in=['resolved', 'wont_fix']).count()
        in_progress = issues.filter(status='in_progress').count()
        blocked = issues.filter(status='blocked').count()
        
        return Response({
            'unassigned_count': unassigned,
            'in_progress_count': in_progress,
            'blocked_count': blocked
        })


class IssueListView(generics.ListAPIView):
    """
    API endpoint that returns a paginated list of issues.
    Access restricted to authenticated employees of the tenant.
    Supports 'board=true' query param to fetch all active, assigned issues (unpaginated).
    """
    serializer_class = IssueListSerializer
    pagination_class = IssuePagination
    permission_classes = [IsAuthenticated]

    @property
    def paginator(self):
        if self.request.query_params.get('board') == 'true':
            return None
        return super().paginator

    def get_queryset(self):
        # Enforce multi-tenant data isolation at database level
        user = self.request.user
        queryset = Issue.objects.filter(tenant=user.tenant).order_by('order_index', '-created_at')
        
        board_param = self.request.query_params.get('board')
        if board_param == 'true':
            from django.utils import timezone
            from datetime import timedelta
            from django.db.models import Q
            
            # Condition 1: assigned_to is NOT NULL
            queryset = queryset.filter(assigned_to__isnull=False)
            
            # Condition 2: status is active (not Done/WontFix, or Done/WontFix updated within last 24h)
            cutoff = timezone.now() - timedelta(hours=24)
            queryset = queryset.filter(
                Q(status__in=['pending', 'in_progress', 'blocked']) |
                Q(status__in=['resolved', 'wont_fix'], updated_at__gte=cutoff)
            )
        else:
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
                
            assigned_param = self.request.query_params.get('assigned')
            if assigned_param == 'false':
                queryset = queryset.filter(assigned_to__isnull=True)
            elif assigned_param == 'true':
                queryset = queryset.filter(assigned_to__isnull=False)
                
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        # If board=true, wrap in pagination envelope for frontend compatibility
        if request.query_params.get('board') == 'true':
            return Response({
                'count': len(serializer.data),
                'next': None,
                'previous': None,
                'results': serializer.data
            })
        return Response(serializer.data)



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


class IssueBulkAssignView(APIView):
    """
    API endpoint that allows tenant administrators/managers to bulk assign issues
    to an operator, triggering a single combined WhatsApp message.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        task_ids = request.data.get('task_ids')
        assignee_id = request.data.get('assignee_id')

        if not isinstance(task_ids, list):
            return Response({"detail": "task_ids must be a list of integers."}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.tenant:
            return Response({"detail": "User has no tenant assigned."}, status=status.HTTP_400_BAD_REQUEST)
        # 1. Fetch requested tasks for user's tenant
        issues = list(Issue.objects.filter(tenant=user.tenant, id__in=task_ids))
        if len(issues) != len(set(task_ids)):
            return Response({"detail": "Some tasks do not exist or do not belong to this tenant."}, status=status.HTTP_400_BAD_REQUEST)

        # Prevent bulk-assigning resolved or wont_fix tasks
        resolved_issues = [i for i in issues if i.status in ('resolved', 'wont_fix')]
        if resolved_issues:
            return Response({"detail": "Resolved or won't fix tasks cannot be reassigned."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Verify assignee belongs to the same tenant and is an operator
        assignee = None
        if assignee_id is not None and assignee_id != "":
            try:
                assignee = User.objects.get(id=assignee_id, tenant=user.tenant)
                if not hasattr(assignee, 'operator_profile'):
                    return Response({"detail": "Assigned user must be an operator (have an OperatorProfile)."}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({"detail": "Assigned operator does not exist or does not belong to this tenant."}, status=status.HTTP_400_BAD_REQUEST)

        # Update assignment in a database transaction
        changed_issues = []
        with transaction.atomic():
            for issue in issues:
                old_assigned = issue.assigned_to
                if old_assigned != assignee:
                    issue.assigned_to = assignee
                    issue._skip_whatsapp = True
                    issue.save()
                    changed_issues.append(issue)

        # 3. Notification Logic
        if assignee and changed_issues:
            phone_number = None
            hub_token = None
            if hasattr(assignee, 'operator_profile'):
                phone_number = assignee.operator_profile.phone_number
                hub_token = assignee.operator_profile.hub_token

            if phone_number:
                # Format bulk message
                task_items = []
                for idx, issue in enumerate(changed_issues, 1):
                    desc = issue.description
                    if len(desc) > 60:
                        desc = desc[:57] + "..."
                    task_items.append(f"{idx}. {desc}")

                from django.conf import settings
                frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
                hub_link = f"{frontend_url}/work/hub?token={hub_token}"

                message_header = f"Hola {assignee.username},\ntienes {len(changed_issues)} nuevas tareas asignadas:\n"
                message_footer = f"\nPuedes ver todo tu trabajo pendiente en tu panel:\n{hub_link}"

                # Character Limit Safety (1600 total)
                max_list_chars = 1500 - len(message_header) - len(message_footer)
                current_list_str = ""
                truncated_count = 0

                for item in task_items:
                    if len(current_list_str) + len(item) + 2 <= max_list_chars:
                        current_list_str += (item + "\n")
                    else:
                        truncated_count += 1

                if truncated_count > 0:
                    current_list_str += f"... y {truncated_count} más\n"

                message_body = message_header + current_list_str.rstrip() + message_footer

                # Send WhatsApp notification asynchronously
                from .services.whatsapp import send_whatsapp_message
                import sys
                import threading
                is_testing = 'test' in sys.argv or getattr(settings, 'TESTING', False)
                if is_testing:
                    send_whatsapp_message(phone_number, message_body)
                else:
                    thread = threading.Thread(target=send_whatsapp_message, args=(phone_number, message_body))
                    thread.daemon = True
                    thread.start()

        return Response({"status": "success", "updated_count": len(changed_issues)}, status=status.HTTP_200_OK)







