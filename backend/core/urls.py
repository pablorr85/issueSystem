from django.urls import path
from .views import TenantConfigView, IssueCreateView, IssueListView, IssueStatusUpdateView

urlpatterns = [
    path('tenant/<uuid:id>/config/', TenantConfigView.as_view(), name='tenant-config'),
    path('issues/', IssueListView.as_view(), name='issue-list'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
    path('issues/<int:pk>/status/', IssueStatusUpdateView.as_view(), name='issue-status-update'),
]
