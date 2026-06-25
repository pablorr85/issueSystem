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
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('blocked', 'Blocked'),
        ('wont_fix', 'Wont Fix'),
    ]

    tenant: Tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='issues',
        db_index=True,
        help_text="Tenant this issue belongs to."
    )
    status: str = models.CharField(
        max_length=50,
        default='pending',
        choices=STATUS_CHOICES,
        help_text="Status of the issue (e.g. pending, in_progress, resolved, wont_fix)."
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
    image = models.ImageField(
        upload_to='issues/',
        blank=True,
        null=True,
        help_text="Uploaded photo evidence of the issue."
    )
    order_index = models.IntegerField(
        default=0,
        db_index=True,
        help_text="Custom priority ordering index."
    )
    extra_data: Dict[str, Any] = models.JSONField(
        default=dict,
        blank=True,
        help_text="Tenant-specific dynamic key-value fields."
    )
    assigned_to = models.ForeignKey(
        'User',
        on_delete=models.SET_NULL,
        related_name='assigned_issues',
        null=True,
        blank=True,
        db_index=True,
        help_text="Employee user (operator) assigned to resolve this issue."
    )
    secure_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        null=True,
        blank=True,
        help_text="Secure passwordless lookup token for operators."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.secure_token:
            self.secure_token = uuid.uuid4()
        super().save(*args, **kwargs)

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


class OperatorProfile(models.Model):
    """
    Profile for an operator, linked to a custom User, containing their contact details.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='operator_profile',
        help_text="User associated with this operator profile."
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Phone number for notification/integration (e.g. WhatsApp)."
    )
    hub_token = models.UUIDField(
        default=uuid.uuid4,
        unique=True,
        editable=False,
        help_text="Unique UUID token for passwordless operator dashboard access."
    )

    def __str__(self) -> str:
        return f"Operator Profile for {self.user.username}"


class IssueComment(models.Model):
    """
    Chronological communication log/timeline notes and system logs for an issue.
    """
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='comments',
        help_text="The issue this comment/log belongs to."
    )
    author_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comments',
        help_text="User (manager/admin) who authored this comment, if applicable."
    )
    author_operator = models.ForeignKey(
        OperatorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='comments',
        help_text="Operator who authored this comment, if applicable."
    )
    comment_text = models.TextField(
        help_text="The actual text content of the note/comment."
    )
    is_system_log = models.BooleanField(
        default=False,
        help_text="Whether this entry was auto-generated by the system as an audit event."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self) -> str:
        author = "System"
        if self.author_user:
            author = self.author_user.username
        elif self.author_operator:
            author = self.author_operator.user.username
        return f"Comment by {author} on Issue #{self.issue.id} at {self.created_at}"



