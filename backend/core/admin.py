from django.contrib import admin
from .models import Tenant, CustomField, Issue

class CustomFieldInline(admin.TabularInline):
    model = CustomField
    extra = 1


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    inlines = [CustomFieldInline]


@admin.register(CustomField)
class CustomFieldAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'name', 'field_type', 'required', 'created_at')
    list_filter = ('tenant', 'field_type', 'required')
    search_fields = ('name', 'tenant__name')


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'tenant', 'status', 'created_at', 'updated_at')
    list_filter = ('tenant', 'status')
    search_fields = ('description', 'tenant__name')
    readonly_fields = ('created_at', 'updated_at')
