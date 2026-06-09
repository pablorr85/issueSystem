import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from typing import Any, Dict

class Tenant(models.Model):
    """
    Represents a client tenant (e.g., Theme Park, Zoo, Property Management).
    Holds global information, visual configurations, and identifiers.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name: str = models.CharField(max_length=255)
    logo_url: str = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional logo URL for the tenant."
    )
    visual_config: Dict[str, Any] = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tenant visual configuration containing colors, branding elements."
    )
    is_public_reporting_enabled = models.BooleanField(
        default=True,
        help_text="Whether anonymous users can report issues for this location."
    )
    default_language = models.CharField(
        max_length=5,
        choices=[('es', 'Spanish'), ('en', 'English')],
        default='es',
        help_text="Default language for the tenant interface."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return self.name


class CustomField(models.Model):
    """
    Defines the dynamic schema required by a specific Tenant's Issues.
    """
    FIELD_TYPES = (
        ('text', 'Text'),
        ('number', 'Number'),
        ('boolean', 'Boolean'),
        ('select', 'Select'),
    )

    tenant: Tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='custom_fields',
        db_index=True,
        help_text="Tenant that defines this custom field."
    )
    name: str = models.CharField(max_length=100)
    field_type: str = models.CharField(
        max_length=20,
        choices=FIELD_TYPES,
        default='text'
    )
    required: bool = models.BooleanField(
        default=False,
        help_text="Whether this field must be filled when submitting an issue."
    )
    options: list = models.JSONField(
        default=list,
        blank=True,
        help_text="List of options for select fields."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tenant', 'name')

    def __str__(self) -> str:
        return f"{self.tenant.name} - {self.name} ({self.field_type})"


class Issue(models.Model):
    """
    The core entity representing a reported maintenance or repair problem.
    """
    tenant: Tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='issues',
        db_index=True,
        help_text="Tenant this issue belongs to."
    )
    status: str = models.CharField(
        max_length=50,
        default='open',
        help_text="Status of the issue (e.g. open, in_progress, resolved)."
    )
    description: str = models.TextField(
        help_text="Detailed description of the issue."
    )
    photo_url: str = models.URLField(
        max_length=500,
        blank=True,
        null=True,
        help_text="Optional link to a uploaded photo showing the issue."
    )
    extra_data: Dict[str, Any] = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tenant-specific dynamic key-value fields."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"Issue #{self.id} ({self.tenant.name}) - {self.status}"


class User(AbstractUser):
    """
    Custom User model extending Django's standard User to cryptographically
    bind employees to a Tenant company.
    """
    tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='users',
        null=True,
        blank=True,
        db_index=True,
        help_text="Tenant that this employee belongs to."
    )

    def __str__(self) -> str:
        if self.tenant:
            return f"{self.username} ({self.tenant.name})"
        return self.username

