from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    TenantConfigView,
    IssueCreateView,
    IssueListView,
    IssueStatusUpdateView,
    CustomTokenObtainPairView,
)

urlpatterns = [
    path('tenant/<uuid:id>/config/', TenantConfigView.as_view(), name='tenant-config'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('issues/', IssueListView.as_view(), name='issue-list'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
    path('issues/<int:pk>/status/', IssueStatusUpdateView.as_view(), name='issue-status-update'),
]
