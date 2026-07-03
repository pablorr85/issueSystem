# Generated manually to backfill resolved_at fields for issues

from django.db import migrations

def backfill_resolved_at(apps, schema_editor):
    Issue = apps.get_model('core', 'Issue')
    # Filter resolved and wont_fix issues
    issues = Issue.objects.filter(status__in=('resolved', 'wont_fix'))
    for issue in issues:
        # Check if there is an IssueComment system log that marks this resolution
        target_suffix = "to resolved" if issue.status == 'resolved' else "to wont fix"
        comment = issue.comments.filter(
            is_system_log=True,
            comment_text__iendswith=target_suffix
        ).order_by('-created_at').first()
        if comment:
            issue.resolved_at = comment.created_at
        else:
            issue.resolved_at = issue.updated_at
        issue.save(update_fields=['resolved_at'])

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_issue_resolved_at'),
    ]

    operations = [
        migrations.RunPython(backfill_resolved_at, reverse_code=migrations.RunPython.noop),
    ]
