from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    TenantConfigView,
    IssueCreateView,
    IssueListView,
    IssueStatusUpdateView,
    CustomTokenObtainPairView,
    OperatorListView,
    IssueAssignmentView,
    OperatorTaskView,
    OperatorHubView,
    IssueUpdateView,
    IssueReorderView,
)

urlpatterns = [
    path('tenant/<uuid:id>/config/', TenantConfigView.as_view(), name='tenant-config'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('issues/', IssueListView.as_view(), name='issue-list'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
    path('issues/reorder/', IssueReorderView.as_view(), name='issue-reorder'),
    path('issues/<int:pk>/status/', IssueStatusUpdateView.as_view(), name='issue-status-update'),
    path('operators/', OperatorListView.as_view(), name='operator-list'),
    path('issues/<int:pk>/assign/', IssueAssignmentView.as_view(), name='issue-assign'),
    path('tasks/<uuid:secure_token>/', OperatorTaskView.as_view(), name='operator-task-detail'),
    path('operator/hub/', OperatorHubView.as_view(), name='operator-hub'),
    path('issues/<int:pk>/', IssueUpdateView.as_view(), name='issue-detail-update'),
]

