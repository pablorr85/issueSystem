import threading
from typing import Optional, Any
from django.utils.deprecation import MiddlewareMixin
from core.models import Tenant

_thread_locals = threading.local()


def get_current_tenant() -> Optional[Tenant]:
    """
    Retrieve the current Tenant bound to the active thread context.
    """
    return getattr(_thread_locals, 'tenant', None)


def set_current_tenant(tenant: Optional[Tenant]) -> None:
    """
    Bind a Tenant instance to the active thread context.
    """
    _thread_locals.tenant = tenant


def clear_current_tenant() -> None:
    """
    Clear the Tenant instance from the active thread context.
    """
    if hasattr(_thread_locals, 'tenant'):
        delattr(_thread_locals, 'tenant')


class TenantContextMiddleware(MiddlewareMixin):
    """
    Middleware that automatically extracts and binds the Tenant context
    for each HTTP request lifecycle.
    """

    def process_request(self, request: Any) -> None:
        clear_current_tenant()
        tenant = None
        user = None

        # 1. Standard Django authenticated user (Session authentication)
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
        # 2. Test environment DRF force_authenticate user
        elif hasattr(request, '_force_auth_user') and request._force_auth_user:
            user = request._force_auth_user
        # 3. SimpleJWT Authorization header authentication
        elif 'HTTP_AUTHORIZATION' in request.META or 'Authorization' in request.headers:
            try:
                from rest_framework_simplejwt.authentication import JWTAuthentication
                auth_result = JWTAuthentication().authenticate(request)
                if auth_result:
                    user, _ = auth_result
            except Exception:
                pass

        if user:
            tenant = getattr(user, 'tenant', None)

        # 4. Public / Anonymous reporting or Operator token lookup fallback
        if not tenant:
            header_tenant_id = request.headers.get('X-Tenant-ID') or request.META.get('HTTP_X_TENANT_ID')
            query_tenant_id = request.GET.get('tenant_id')
            tenant_id = header_tenant_id or query_tenant_id

            if tenant_id:
                try:
                    tenant = Tenant.objects.get(id=tenant_id)
                except (Tenant.DoesNotExist, ValueError):
                    tenant = None

        if tenant:
            set_current_tenant(tenant)

    def process_response(self, request: Any, response: Any) -> Any:
        clear_current_tenant()
        return response

    def process_exception(self, request: Any, exception: Exception) -> None:
        clear_current_tenant()

