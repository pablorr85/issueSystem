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


class Zone(models.Model):
    """
    Represents a specific physical location, building block, or area within a Tenant facility.
    """
    tenant: Tenant = models.ForeignKey(
        Tenant,
        on_delete=models.CASCADE,
        related_name='zones',
        db_index=True,
        help_text="Tenant that owns this zone/facility area."
    )
    name: str = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tenant', 'name')

    def __str__(self) -> str:
        return f"{self.tenant.name} - {self.name}"


class Issue(models.Model):
    """
    The core entity representing a reported maintenance or repair problem.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('qa', 'QA / Verification'),
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
    order_number: str = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Auto-generated sequential order identifier (e.g. WO-00042)."
    )
    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        related_name='issues',
        null=True,
        blank=True,
        db_index=True,
        help_text="Physical zone/area associated with this issue."
    )
    status: str = models.CharField(
        max_length=50,
        default='pending',
        choices=STATUS_CHOICES,
        help_text="Status of the issue (e.g. pending, in_progress, qa, resolved, wont_fix)."
    )
    title: str = models.CharField(
        max_length=100,
        default="",
        blank=True,
        help_text="Concise summary title of the issue."
    )
    description: str = models.TextField(
        help_text="Detailed description of the issue."
    )
    qa_checklist: str = models.TextField(
        blank=True,
        default="",
        help_text="Custom verification checklist steps specified by manager, separated by line breaks."
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
    started_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when execution started."
    )
    completed_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when execution completed (or submitted to QA)."
    )
    resolved_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Timestamp when the issue was resolved or marked wont_fix."
    )
    total_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cached total material/labor cost logged for this task."
    )
    total_time_spent_hours = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Cached total effective time logged in hours for this task."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args: Any, **kwargs: Any) -> None:
        if not self.secure_token:
            self.secure_token = uuid.uuid4()
        super().save(*args, **kwargs)
        if not self.order_number:
            self.order_number = f"WO-{self.id:05d}"
            super().save(update_fields=['order_number'])

    def __str__(self) -> str:
        return f"Issue #{self.id} ({self.order_number or 'No WO'}) ({self.tenant.name}) - {self.status}"



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


class TaskLog(models.Model):
    """
    Chronological activity logbook for tracking expenses, wrench time,
    and photo proof of work.
    """
    task = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='logs',
        help_text="The task (issue) this log belongs to."
    )
    text = models.TextField(
        help_text="Text description or update comment."
    )
    image = models.ImageField(
        upload_to='task_logs/',
        null=True,
        blank=True,
        help_text="Uploaded evidence or proof of work photo."
    )
    cost = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Incremental material or service cost for this step."
    )
    time_spent_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Incremental effective labor time spent in hours (e.g. 1.5)."
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp when the log was created."
    )
    author_type = models.CharField(
        max_length=20,
        choices=[('MANAGER', 'Manager'), ('OPERATOR', 'Operator')],
        default='OPERATOR',
        help_text="Role type of the author."
    )
    author_user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_logs',
        help_text="Admin/Manager user who created this log, if applicable."
    )
    author_operator = models.ForeignKey(
        OperatorProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_logs',
        help_text="Operator profile who created this log, if applicable."
    )

    class Meta:
        ordering = ['created_at']

    def __str__(self) -> str:
        author = "System"
        if self.author_user:
            author = self.author_user.username
        elif self.author_operator:
            author = self.author_operator.user.username
        return f"Log by {author} on Task #{self.task.id} at {self.created_at}"




