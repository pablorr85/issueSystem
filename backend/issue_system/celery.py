import os
from celery import Celery

# Set default Django settings module for 'celery' program
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'issue_system.settings')

app = Celery('issue_system')

# Namespace 'CELERY' means all celery-related config keys should have a `CELERY_` prefix in settings.py
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all installed apps (looking for tasks.py files)
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
