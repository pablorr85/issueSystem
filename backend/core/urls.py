from django.urls import path
from .views import TenantConfigView, IssueCreateView

urlpatterns = [
    path('tenant/<uuid:id>/config/', TenantConfigView.as_view(), name='tenant-config'),
    path('issues/create/', IssueCreateView.as_view(), name='issue-create'),
]
