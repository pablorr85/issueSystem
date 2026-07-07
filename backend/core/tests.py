import uuid
from datetime import timedelta
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Tenant, Issue, OperatorProfile

User = get_user_model()

class OperatorTaskWorkflowTests(APITestCase):
    def setUp(self):
        # Create a Tenant
        self.tenant = Tenant.objects.create(
            name="Test Tenant",
            logo_url="http://example.com/logo.png",
            visual_config={"primaryColor": "#ff0000"}
        )
        
        # Create an Admin user for the Tenant
        self.admin_user = User.objects.create_user(
            username="admin_user",
            password="adminpassword",
            tenant=self.tenant
        )
        
        # Create an Operator user for the Tenant
        self.operator_user = User.objects.create_user(
            username="operator_user",
            password="operatorpassword",
            tenant=self.tenant
        )
        self.operator_profile = OperatorProfile.objects.create(
            user=self.operator_user,
            phone_number="+123456789"
        )
        
        # Create another Tenant to test isolation
        self.other_tenant = Tenant.objects.create(
            name="Other Tenant"
        )
        self.other_operator_user = User.objects.create_user(
            username="other_operator",
            password="otherpassword",
            tenant=self.other_tenant
        )
        self.other_operator_profile = OperatorProfile.objects.create(
            user=self.other_operator_user,
            phone_number="+987654321"
        )

        # Create an Issue for the Tenant
        self.issue = Issue.objects.create(
            tenant=self.tenant,
            description="Leaky faucet",
            status="pending"
        )

    def test_operator_list_tenant_isolation(self):
        # Log in as tenant admin
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('operator-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only list operator_user, not other_operator
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'operator_user')
        self.assertEqual(response.data[0]['phone_number'], '+123456789')

    def test_assign_operator_to_issue(self):
        # Log in as tenant admin
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('issue-assign', kwargs={'pk': self.issue.pk})
        data = {
            'assigned_to': self.operator_user.pk,
            'status': 'in_progress'
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.issue.refresh_from_db()
        self.assertEqual(self.issue.assigned_to, self.operator_user)
        self.assertEqual(self.issue.status, 'in_progress')

    def test_assign_invalid_operator_cross_tenant(self):
        # Log in as tenant admin
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('issue-assign', kwargs={'pk': self.issue.pk})
        data = {
            'assigned_to': self.other_operator_user.pk
        }
        response = self.client.patch(url, data)
        # Should fail due to validation error (cross tenant operator assignment)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_passwordless_task_detail_and_update(self):
        # Secure token check, no authentication needed
        self.client.force_authenticate(user=None)
        
        token = self.issue.secure_token
        self.assertIsNotNone(token)
        
        # Retrieve task details
        url = reverse('operator-task-detail', kwargs={'secure_token': token})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['description'], "Leaky faucet")
        self.assertEqual(response.data['tenant_name'], "Test Tenant")
        self.assertEqual(response.data['tenant_visual_config']['primaryColor'], "#ff0000")
        
        # Update task status (Operator accepting/resolving task)
        data = {'status': 'resolved'}
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.issue.refresh_from_db()
        self.assertEqual(self.issue.status, 'resolved')

    def test_update_issue_details_success(self):
        # Authenticate as admin user
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('issue-detail-update', kwargs={'pk': self.issue.pk})
        data = {
            'description': 'Leaky faucet in bathroom',
            'status': 'in_progress',
            'assigned_to': self.operator_user.pk,
            'extra_data': {'urgency': 'high'}
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.issue.refresh_from_db()
        self.assertEqual(self.issue.description, 'Leaky faucet in bathroom')
        self.assertEqual(self.issue.status, 'in_progress')
        self.assertEqual(self.issue.assigned_to, self.operator_user)
        self.assertEqual(self.issue.extra_data, {'urgency': 'high'})

    def test_issue_title_handling(self):
        # 1. Create issue with title
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': self.tenant.id,
            'title': 'Test Task Title',
            'description': 'Test description of the issue',
            'extra_data': {}
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Task Title')

        # 2. Create issue without title (should fallback to description[:50])
        data_no_title = {
            'tenant_id': self.tenant.id,
            'description': 'Very long description that should be truncated to fifty characters when creating a title fallback',
            'extra_data': {}
        }
        response = self.client.post(url, data_no_title, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Very long description that should be truncated to ')

        # 3. Update title
        issue_id = response.data['id']
        detail_url = reverse('issue-detail-update', kwargs={'pk': issue_id})
        update_data = {
            'title': 'Updated Title',
            'description': 'Some description'
        }
        response = self.client.patch(detail_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Updated Title')

    def test_update_issue_details_cross_tenant_denied(self):
        # Authenticate as admin of self.tenant, try to update other_tenant's issue
        other_issue = Issue.objects.create(
            tenant=self.other_tenant,
            description="Other issue",
            status="pending"
        )
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-detail-update', kwargs={'pk': other_issue.pk})
        data = {
            'description': 'Hacked description'
        }
        response = self.client.patch(url, data, format='json')
        # Should return 404 because get_queryset filters by tenant
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_wont_fix_status_and_resolved_at(self):
        # 1. Authenticate as admin user
        self.client.force_authenticate(user=self.admin_user)
        
        # 2. Update status of the issue to 'wont_fix'
        url = reverse('issue-detail-update', kwargs={'pk': self.issue.pk})
        data = {
            'status': 'wont_fix'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that resolved_at is not None
        self.issue.refresh_from_db()
        self.assertEqual(self.issue.status, 'wont_fix')
        self.assertIsNotNone(response.data.get('resolved_at'))
        
        # 3. Retrieve list and check that resolved_at is present
        list_url = reverse('issue-list')
        list_response = self.client.get(list_url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        # Check that the issue has resolved_at in list results
        found_issue = next(item for item in list_response.data['results'] if item['id'] == self.issue.id)
        self.assertIsNotNone(found_issue.get('resolved_at'))

        # 4. Change status back to pending and verify resolved_at is None
        data = {
            'status': 'pending'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsNone(response.data.get('resolved_at'))


from django.core.files.uploadedfile import SimpleUploadedFile
from .services.whatsapp import WHATSAPP_MOCK_REGISTRY
import tempfile
import shutil
from django.conf import settings

class MediaUploadAndNotificationTests(APITestCase):
    def setUp(self):
        # Create a Tenant
        self.tenant = Tenant.objects.create(
            name="Test Tenant",
            logo_url="http://example.com/logo.png",
            visual_config={"primaryColor": "#ff0000"}
        )
        
        # Create an Operator user for the Tenant
        self.operator_user = User.objects.create_user(
            username="operator_user",
            password="operatorpassword",
            tenant=self.tenant
        )
        self.operator_profile = OperatorProfile.objects.create(
            user=self.operator_user,
            phone_number="+123456789"
        )
        
        # Create an Issue for the Tenant
        self.issue = Issue.objects.create(
            tenant=self.tenant,
            description="Leaky faucet",
            status="pending"
        )
        
        # Setup temporary media root for testing uploads
        self.temp_media = tempfile.mkdtemp()
        self.original_media_root = settings.MEDIA_ROOT
        settings.MEDIA_ROOT = self.temp_media

    def tearDown(self):
        # Clean up temporary media files
        shutil.rmtree(self.temp_media, ignore_errors=True)
        settings.MEDIA_ROOT = self.original_media_root

    def test_create_issue_with_image_upload(self):
        url = reverse('issue-create')
        
        # Create a mock image file
        mock_image = SimpleUploadedFile(
            name='test_incident.gif',
            content=b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x4c\x01\x00\x3b', # 1x1 pixel gif representation
            content_type='image/gif'
        )

        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Broken window in lobby',
            'image': mock_image,
            'extra_data': '{"urgency": "high"}' # Multipart forms send JSON as string
        }

        response = self.client.post(url, data, format='multipart')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('image', response.data)
        self.assertIsNotNone(response.data['image'])
        self.assertIn('test_incident.gif', response.data['image'])
        
        # Verify db persistence
        created_issue = Issue.objects.get(description='Broken window in lobby')
        self.assertTrue(created_issue.image.name.endswith('test_incident.gif'))
        self.assertEqual(created_issue.extra_data, {"urgency": "high"})

    def test_whatsapp_notification_sent_on_operator_assignment(self):
        # Clear mock registry
        WHATSAPP_MOCK_REGISTRY.clear()
        
        # Authenticate as admin user to change assignment
        admin_user = User.objects.create_user(
            username="admin_user",
            password="adminpassword",
            tenant=self.tenant
        )
        self.client.force_authenticate(user=admin_user)
        
        url = reverse('issue-assign', kwargs={'pk': self.issue.pk})
        data = {
            'assigned_to': self.operator_user.pk
        }
        
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify signal fired and mock WhatsApp notification registered
        self.assertEqual(len(WHATSAPP_MOCK_REGISTRY), 1)
        sent_message = WHATSAPP_MOCK_REGISTRY[0]
        self.assertEqual(sent_message['to'], '+123456789')
        self.assertIn('Se te ha asignado una nueva tarea', sent_message['body'])
        
        import re
        from django.core import signing
        match = re.search(r"token=([a-zA-Z0-9_\-\.:]+)", sent_message['body'])
        self.assertTrue(match)
        token = match.group(1)
        payload = signing.loads(token)
        self.assertEqual(payload['task_id'], self.issue.id)
        self.assertEqual(payload['operator_id'], self.operator_user.id)
        
        hub_token = self.operator_profile.hub_token
        self.assertIn(f"hub?token={hub_token}", sent_message['body'])
        self.assertEqual(sent_message['status'], 'sent_mock')

        # Re-assignment: changing to another operator should fire another notification
        WHATSAPP_MOCK_REGISTRY.clear()
        another_operator = User.objects.create_user(
            username="another_op",
            password="password1",
            tenant=self.tenant
        )
        another_profile = OperatorProfile.objects.create(
            user=another_operator,
            phone_number="+444444444"
        )
        data = {
            'assigned_to': another_operator.pk
        }
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should fire another notification because it is reassigned to a different operator
        self.assertEqual(len(WHATSAPP_MOCK_REGISTRY), 1)
        self.assertEqual(WHATSAPP_MOCK_REGISTRY[0]['to'], '+444444444')
        self.assertIn(f"hub?token={another_profile.hub_token}", WHATSAPP_MOCK_REGISTRY[0]['body'])


class OperatorHubTests(APITestCase):
    def setUp(self):
        # Create a Tenant
        self.tenant = Tenant.objects.create(
            name="Hub Tenant"
        )
        # Create an Operator
        self.operator_user = User.objects.create_user(
            username="hub_operator",
            password="password",
            tenant=self.tenant
        )
        self.operator_profile = OperatorProfile.objects.create(
            user=self.operator_user,
            phone_number="+34600112233"
        )
        
        # Create Issues
        self.issue_pending = Issue.objects.create(
            tenant=self.tenant,
            description="Pending task",
            status="pending",
            assigned_to=self.operator_user
        )
        self.issue_in_progress = Issue.objects.create(
            tenant=self.tenant,
            description="In progress task",
            status="in_progress",
            assigned_to=self.operator_user
        )
        self.issue_resolved = Issue.objects.create(
            tenant=self.tenant,
            description="Resolved task",
            status="resolved",
            assigned_to=self.operator_user
        )
        
        # Create another operator's issue
        self.other_user = User.objects.create_user(
            username="other_operator",
            password="password",
            tenant=self.tenant
        )
        self.other_profile = OperatorProfile.objects.create(
            user=self.other_user,
            phone_number="+34600112234"
        )
        self.other_issue = Issue.objects.create(
            tenant=self.tenant,
            description="Other operator task",
            status="pending",
            assigned_to=self.other_user
        )

    def test_operator_hub_success(self):
        token = self.operator_profile.hub_token
        url = reverse('operator-hub')
        
        response = self.client.get(url, {'token': str(token)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only return pending and in_progress tasks for this operator
        self.assertEqual(len(response.data), 2)
        descriptions = [task['description'] for task in response.data]
        self.assertIn("Pending task", descriptions)
        self.assertIn("In progress task", descriptions)
        self.assertNotIn("Resolved task", descriptions)
        self.assertNotIn("Other operator task", descriptions)

    def test_operator_hub_missing_token(self):
        url = reverse('operator-hub')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_operator_hub_invalid_token(self):
        url = reverse('operator-hub')
        response = self.client.get(url, {'token': 'not-a-uuid'})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get(url, {'token': str(uuid.uuid4())})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class IssueReorderAPITests(APITestCase):
    def setUp(self):
        self.tenant = Tenant.objects.create(name="Zoo Park")
        self.user = User.objects.create_user(
            username="manager",
            password="password",
            tenant=self.tenant
        )
        self.issue1 = Issue.objects.create(tenant=self.tenant, description="Issue 1", order_index=0)
        self.issue2 = Issue.objects.create(tenant=self.tenant, description="Issue 2", order_index=0)
        self.issue3 = Issue.objects.create(tenant=self.tenant, description="Issue 3", order_index=0)
        self.client.force_authenticate(user=self.user)

    def test_bulk_reorder_success(self):
        url = reverse('issue-reorder')
        data = {
            'ordered_ids': [self.issue3.id, self.issue1.id, self.issue2.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.issue1.refresh_from_db()
        self.issue2.refresh_from_db()
        self.issue3.refresh_from_db()

        self.assertEqual(self.issue3.order_index, 0)
        self.assertEqual(self.issue1.order_index, 1)
        self.assertEqual(self.issue2.order_index, 2)

    def test_bulk_reorder_invalid_tenant_issue(self):
        other_tenant = Tenant.objects.create(name="Other Park")
        other_issue = Issue.objects.create(tenant=other_tenant, description="Other Issue")

        url = reverse('issue-reorder')
        data = {
            'ordered_ids': [self.issue1.id, other_issue.id]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


from .models import IssueComment

class IssueCommentsAndBlockedAPITests(APITestCase):
    def setUp(self):
        self.tenant = Tenant.objects.create(name="Zoo Theme Park")
        
        # Managers / Users
        self.manager = User.objects.create_user(
            username="manager_test", password="password", tenant=self.tenant
        )
        self.other_manager = User.objects.create_user(
            username="other_manager", password="password", tenant=Tenant.objects.create(name="Another Tenant")
        )

        # Operators
        self.operator = User.objects.create_user(
            username="op_test", password="password", tenant=self.tenant
        )
        self.operator_profile = OperatorProfile.objects.create(
            user=self.operator, phone_number="+34699000111"
        )
        
        self.other_operator = User.objects.create_user(
            username="other_op", password="password", tenant=self.tenant
        )
        self.other_operator_profile = OperatorProfile.objects.create(
            user=self.other_operator, phone_number="+34699000222"
        )

        # Issue
        self.issue = Issue.objects.create(
            tenant=self.tenant,
            description="Broken security fence",
            status="pending"
        )

    def test_audit_logs_created_on_operator_reassignment(self):
        # 1. Initially unassigned
        self.assertIsNone(self.issue.assigned_to)
        
        # 2. Assign to operator
        self.issue.assigned_to = self.operator
        self.issue.save()

        # Should generate an audit log comment
        comments = IssueComment.objects.filter(issue=self.issue, is_system_log=True)
        self.assertEqual(comments.count(), 1)
        self.assertIn("Task reassigned from Unassigned to op_test", comments[0].comment_text)

        # 3. Reassign to other_operator
        self.issue.assigned_to = self.other_operator
        self.issue.save()

        comments = IssueComment.objects.filter(issue=self.issue, is_system_log=True).order_by('created_at')
        self.assertEqual(comments.count(), 2)
        self.assertIn("Task reassigned from op_test to other_op", comments[1].comment_text)

    def test_audit_logs_created_on_blocked_transition(self):
        # 1. Change status to blocked
        self.issue.status = "blocked"
        self.issue.save()

        comments = IssueComment.objects.filter(issue=self.issue, is_system_log=True)
        self.assertEqual(comments.count(), 1)
        self.assertIn("Status changed from Pending to Blocked", comments[0].comment_text)

        # 2. Transition back to in_progress
        self.issue.status = "in_progress"
        self.issue.save()

        comments = IssueComment.objects.filter(issue=self.issue, is_system_log=True).order_by('created_at')
        self.assertEqual(comments.count(), 2)
        self.assertIn("Status changed from Blocked to In progress", comments[1].comment_text)

    def test_get_comments_jwt_authenticated(self):
        # Create mock comments
        IssueComment.objects.create(issue=self.issue, comment_text="Test comment 1", author_user=self.manager)
        
        url = reverse('issue-comments', kwargs={'issue_id': self.issue.pk})
        
        # Unauthorized if not logged in
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Authorized manager
        self.client.force_authenticate(user=self.manager)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['comment_text'], "Test comment 1")
        self.assertEqual(response.data[0]['role'], "manager")
        self.assertEqual(response.data[0]['author_name'], "manager_test")

        # Denied other manager (different tenant)
        self.client.force_authenticate(user=self.other_manager)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_comments_token_authenticated(self):
        # Create mock comments
        IssueComment.objects.create(issue=self.issue, comment_text="Test comment 1")
        url = reverse('issue-comments', kwargs={'issue_id': self.issue.pk})

        # 1. Use secure task token
        token = self.issue.secure_token
        response = self.client.get(url, {'token': str(token)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # 2. Use operator hub token (must be assigned)
        self.issue.assigned_to = self.operator
        self.issue.save()
        
        hub_token = self.operator_profile.hub_token
        response = self.client.get(url, {'token': str(hub_token)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # If not assigned, should fail
        self.issue.assigned_to = self.other_operator
        self.issue.save()
        
        response = self.client.get(url, {'token': str(hub_token)})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_post_comments_jwt_and_tokens(self):
        url = reverse('issue-comments', kwargs={'issue_id': self.issue.pk})
        data = {'comment_text': "Manager note"}

        # 1. JWT auth user
        self.client.force_authenticate(user=self.manager)
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author_name'], "manager_test")
        self.assertEqual(response.data['role'], "manager")

        # 2. Secure task token (assigned operator author resolver)
        self.client.force_authenticate(user=None)
        self.issue.assigned_to = self.operator
        self.issue.save()

        task_token = self.issue.secure_token
        data = {'comment_text': "Operator note via task token"}
        response = self.client.post(f"{url}?token={task_token}", data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['author_name'], "op_test")
        self.assertEqual(response.data['role'], "operator")


from .services.whatsapp import WHATSAPP_MOCK_REGISTRY

class IssueBulkAssignmentTests(APITestCase):
    def setUp(self):
        WHATSAPP_MOCK_REGISTRY.clear()
        
        # Tenant A
        self.tenant_a = Tenant.objects.create(name="Tenant A")
        self.admin_a = User.objects.create_user(username="admin_a", password="password", tenant=self.tenant_a)
        self.operator_a = User.objects.create_user(username="op_a", password="password", tenant=self.tenant_a)
        self.profile_a = OperatorProfile.objects.create(user=self.operator_a, phone_number="+34600111111")
        
        self.issue1 = Issue.objects.create(tenant=self.tenant_a, description="Fix lightbulb", status="pending")
        self.issue2 = Issue.objects.create(tenant=self.tenant_a, description="Fix AC unit", status="pending")
        self.issue3 = Issue.objects.create(tenant=self.tenant_a, description="Paint wall", status="pending", assigned_to=self.operator_a)
        
        # Tenant B
        self.tenant_b = Tenant.objects.create(name="Tenant B")
        self.admin_b = User.objects.create_user(username="admin_b", password="password", tenant=self.tenant_b)
        self.operator_b = User.objects.create_user(username="op_b", password="password", tenant=self.tenant_b)
        self.profile_b = OperatorProfile.objects.create(user=self.operator_b, phone_number="+34600222222")
        self.issue_b = Issue.objects.create(tenant=self.tenant_b, description="Mow lawn", status="pending")

    def test_bulk_assign_success(self):
        WHATSAPP_MOCK_REGISTRY.clear()
        self.client.force_authenticate(user=self.admin_a)
        url = reverse('issue-bulk-assign')
        data = {
            'task_ids': [self.issue1.id, self.issue2.id, self.issue3.id],
            'assignee_id': self.operator_a.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'success')
        # Only issue1 and issue2 were modified since issue3 was already assigned to operator_a
        self.assertEqual(response.data['updated_count'], 2)
        
        # Refresh from DB
        self.issue1.refresh_from_db()
        self.issue2.refresh_from_db()
        self.assertEqual(self.issue1.assigned_to, self.operator_a)
        self.assertEqual(self.issue2.assigned_to, self.operator_a)
        
        # Verify audit logs created
        self.assertEqual(self.issue1.comments.filter(is_system_log=True).count(), 1)
        self.assertEqual(self.issue2.comments.filter(is_system_log=True).count(), 1)
        # issue3 shouldn't have new audit logs since its assignee didn't change
        self.assertEqual(self.issue3.comments.filter(is_system_log=True).count(), 0)

        # Verify WhatsApp notification registry
        # We should only have 1 combined message instead of multiple individual ones
        self.assertEqual(len(WHATSAPP_MOCK_REGISTRY), 1)
        sent_message = WHATSAPP_MOCK_REGISTRY[0]
        self.assertEqual(sent_message['to'], '+34600111111')
        self.assertIn("tienes 2 nuevas tareas asignadas", sent_message['body'])
        self.assertIn("1. Fix lightbulb", sent_message['body'])
        self.assertIn("2. Fix AC unit", sent_message['body'])
        # The third issue should not be in the notification body since it was a redundant update
        self.assertNotIn("Paint wall", sent_message['body'])

    def test_bulk_assign_cross_tenant_denied(self):
        self.client.force_authenticate(user=self.admin_a)
        url = reverse('issue-bulk-assign')
        
        # Try assigning tenant B issue
        data = {
            'task_ids': [self.issue1.id, self.issue_b.id],
            'assignee_id': self.operator_a.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Try assigning to tenant B operator
        data = {
            'task_ids': [self.issue1.id, self.issue2.id],
            'assignee_id': self.operator_b.id
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_bulk_assign_unassign(self):
        WHATSAPP_MOCK_REGISTRY.clear()
        self.client.force_authenticate(user=self.admin_a)
        url = reverse('issue-bulk-assign')
        data = {
            'task_ids': [self.issue3.id],
            'assignee_id': None
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['updated_count'], 1)
        self.issue3.refresh_from_db()
        self.assertIsNone(self.issue3.assigned_to)
        
        # No WhatsApp notifications since assignee was set to None
        self.assertEqual(len(WHATSAPP_MOCK_REGISTRY), 0)

    def test_bulk_assign_resolved_denied(self):
        # Mark self.issue1 as resolved
        self.issue1.status = "resolved"
        self.issue1.save()
        
        self.client.force_authenticate(user=self.admin_a)
        url = reverse('issue-bulk-assign')
        data = {
            'task_ids': [self.issue1.id, self.issue2.id],
            'assignee_id': self.operator_a.id
        }
        response = self.client.post(url, data, format='json')
        # Should be rejected because issue1 is resolved
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Resolved or won't fix tasks cannot be reassigned", response.data['detail'])

    def test_single_assign_resolved_denied(self):
        # Mark self.issue3 as resolved
        self.issue3.status = "resolved"
        self.issue3.save()
        
        self.client.force_authenticate(user=self.admin_a)
        url = reverse('issue-assign', kwargs={'pk': self.issue3.pk})
        
        # Create another operator in tenant A
        op2 = User.objects.create_user(username="op2", password="password", tenant=self.tenant_a)
        OperatorProfile.objects.create(user=op2, phone_number="+34600111112")
        
        data = {
            'assigned_to': op2.id
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Resolved tasks cannot be reassigned", str(response.data))


from core.models import CustomField

class DynamicFieldSchemaValidationTests(APITestCase):
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name="Field Test Tenant",
            logo_url="http://example.com/logo.png",
            visual_config={"primaryColor": "#ff0000"}
        )
        self.admin_user = User.objects.create_user(
            username="val_admin",
            password="valpassword",
            tenant=self.tenant
        )
        
        # Setup custom fields: boolean, number, select (both array of strings and objects)
        self.bool_field = CustomField.objects.create(
            tenant=self.tenant,
            name="required_bool",
            field_type="boolean",
            required=True
        )
        self.num_field = CustomField.objects.create(
            tenant=self.tenant,
            name="optional_num",
            field_type="number",
            required=False
        )
        self.select_str_field = CustomField.objects.create(
            tenant=self.tenant,
            name="select_str",
            field_type="select",
            required=True,
            options=["Option A", "Option B"]
        )
        self.select_dict_field = CustomField.objects.create(
            tenant=self.tenant,
            name="select_dict",
            field_type="select",
            required=False,
            options=[
                {"value": "val1", "label": "Label 1"},
                {"value": "val2", "label": "Label 2"}
            ]
        )

    def test_create_issue_validation_success(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Valid custom fields test',
            'extra_data': {
                'required_bool': True,
                'optional_num': 42.5,
                'select_str': 'Option A',
                'select_dict': 'val2'
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['extra_data']['required_bool'], True)
        self.assertEqual(response.data['extra_data']['optional_num'], 42.5)
        self.assertEqual(response.data['extra_data']['select_str'], 'Option A')
        self.assertEqual(response.data['extra_data']['select_dict'], 'val2')

    def test_create_issue_validation_coercion(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Coercion custom fields test',
            'extra_data': {
                'required_bool': 'true',  # should coerce to True
                'optional_num': '100',   # should coerce to 100
                'select_str': 'Option B'
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['extra_data']['required_bool'], True)
        self.assertEqual(response.data['extra_data']['optional_num'], 100)

    def test_create_issue_validation_missing_required(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Missing required bool test',
            'extra_data': {
                'select_str': 'Option A'
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("required_bool", str(response.data))

    def test_create_issue_validation_invalid_boolean(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Invalid boolean test',
            'extra_data': {
                'required_bool': 'maybe',
                'select_str': 'Option A'
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("must be a boolean", str(response.data))

    def test_create_issue_validation_invalid_number(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Invalid number test',
            'extra_data': {
                'required_bool': True,
                'optional_num': 'not-a-number',
                'select_str': 'Option A'
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("must be a number", str(response.data))

    def test_create_issue_validation_invalid_select_option(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('issue-create')
        data = {
            'tenant_id': str(self.tenant.id),
            'description': 'Invalid select test',
            'extra_data': {
                'required_bool': True,
                'select_str': 'Invalid Option',
            }
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("is not a valid option", str(response.data))


class DashboardAnalyticsAPITests(APITestCase):
    def setUp(self):
        self.tenant = Tenant.objects.create(
            name="Analytics Tenant",
            logo_url="http://example.com/logo.png",
            visual_config={"primaryColor": "#00ff00"}
        )
        self.admin = User.objects.create_user(
            username="analytics_admin",
            password="password",
            tenant=self.tenant
        )
        
        # Operators
        self.op1 = User.objects.create_user(username="operator_one", password="password", tenant=self.tenant)
        self.profile1 = OperatorProfile.objects.create(user=self.op1, phone_number="+1")
        
        self.op2 = User.objects.create_user(username="operator_two", password="password", tenant=self.tenant)
        self.profile2 = OperatorProfile.objects.create(user=self.op2, phone_number="+2")

        # Custom field for zones
        self.zone_field = CustomField.objects.create(
            tenant=self.tenant,
            name="zona_parque",
            field_type="select",
            options=["North", "South", "East", "West"]
        )

        # Issues for Workload (pending/in_progress/blocked)
        # op1: 2 active tasks
        Issue.objects.create(tenant=self.tenant, description="Task 1", status="pending", assigned_to=self.op1, extra_data={"zona_parque": "North"})
        Issue.objects.create(tenant=self.tenant, description="Task 2", status="in_progress", assigned_to=self.op1, extra_data={"zona_parque": "North"})
        
        # op2: 1 active task
        Issue.objects.create(tenant=self.tenant, description="Task 3", status="blocked", assigned_to=self.op2, extra_data={"zona_parque": "South"})

        # Resolved task within last 30 days for op2 (performance)
        res_issue = Issue.objects.create(
            tenant=self.tenant, 
            description="Task 4", 
            status="resolved", 
            assigned_to=self.op2,
            extra_data={"zona_parque": "East"}
        )
        # Explicitly set resolved_at
        res_issue.resolved_at = timezone.now() - timedelta(days=5)
        res_issue.save()

    def test_dashboard_stats_aggregation_success(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('issue-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data
        
        # KPI checks
        self.assertEqual(data['unassigned_count'], 0)
        self.assertEqual(data['in_progress_count'], 1)
        self.assertEqual(data['blocked_count'], 1)

        # Workload checks
        workload = data['operator_workload']
        op1_stat = next(w for w in workload if w['username'] == 'operator_one')
        op2_stat = next(w for w in workload if w['username'] == 'operator_two')
        self.assertEqual(op1_stat['task_count'], 2)
        self.assertEqual(op2_stat['task_count'], 1)

        # Performance checks
        performance = data['operator_performance']
        op2_perf = next(p for p in performance if p['username'] == 'operator_two')
        op1_perf = next(p for p in performance if p['username'] == 'operator_one')
        self.assertEqual(op2_perf['resolved_count'], 1)
        self.assertEqual(op1_perf['resolved_count'], 0)

        # Hotspots checks
        hotspots = data['zone_hotspots']
        self.assertEqual(hotspots[0]['zone'], 'North')
        self.assertEqual(hotspots[0]['count'], 2)
        
        east_spot = next(h for h in hotspots if h['zone'] == 'East')
        south_spot = next(h for h in hotspots if h['zone'] == 'South')
        self.assertEqual(east_spot['count'], 1)
        self.assertEqual(south_spot['count'], 1)

from django.core import signing

class MagicLinkSecurityAndAccessControlTests(APITestCase):
    def setUp(self):
        self.tenant1 = Tenant.objects.create(name="Zoo Tenant")
        self.tenant2 = Tenant.objects.create(name="Mall Tenant")
        
        self.admin = User.objects.create_user(username="admin_user", password="pwd", tenant=self.tenant1)
        self.other_admin = User.objects.create_user(username="other_admin", password="pwd", tenant=self.tenant2)
        
        self.op_user1 = User.objects.create_user(username="op_one", tenant=self.tenant1)
        self.op_profile1 = OperatorProfile.objects.create(user=self.op_user1, phone_number="12345")
        
        self.op_user2 = User.objects.create_user(username="op_two", tenant=self.tenant1)
        self.op_profile2 = OperatorProfile.objects.create(user=self.op_user2, phone_number="67890")

        self.op_other_tenant = User.objects.create_user(username="op_other", tenant=self.tenant2)
        self.op_other_profile = OperatorProfile.objects.create(user=self.op_other_tenant, phone_number="999")
        
        self.issue = Issue.objects.create(
            tenant=self.tenant1,
            description="Fix the main gate",
            status="pending",
            assigned_to=self.op_user1
        )

    def test_toggle_operator_active_success(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('operator-toggle-active', kwargs={'pk': self.op_user1.id})
        
        # Toggle to inactive
        response = self.client.post(url, {"is_active": False})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.op_user1.refresh_from_db()
        self.assertFalse(self.op_user1.is_active)
        
        # Toggle back to active
        response = self.client.post(url, {"is_active": True})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.op_user1.refresh_from_db()
        self.assertTrue(self.op_user1.is_active)

    def test_toggle_operator_active_tenant_isolation(self):
        # Admin from tenant2 trying to toggle operator of tenant1
        self.client.force_authenticate(user=self.other_admin)
        url = reverse('operator-toggle-active', kwargs={'pk': self.op_user1.id})
        response = self.client.post(url, {"is_active": False})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_inactive_operator_magic_link_access_denied(self):
        # Generate valid token for op_user1
        token = signing.dumps({"task_id": self.issue.id, "operator_id": self.op_user1.id})
        url = reverse('operator-task-detail', kwargs={'secure_token': token})
        
        # Check active works
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Deactivate op_user1
        self.op_user1.is_active = False
        self.op_user1.save()
        
        # Access should be forbidden (403)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_inactive_operator_hub_access_denied(self):
        hub_url = reverse('operator-hub')
        
        # Active works
        response = self.client.get(hub_url, {'token': str(self.op_profile1.hub_token)})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Deactivate
        self.op_user1.is_active = False
        self.op_user1.save()
        
        # Forbidden (403)
        response = self.client.get(hub_url, {'token': str(self.op_profile1.hub_token)})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reassigned_task_invalidates_previous_operator_token(self):
        # Generate token for op_user1
        token = signing.dumps({"task_id": self.issue.id, "operator_id": self.op_user1.id})
        url = reverse('operator-task-detail', kwargs={'secure_token': token})
        
        # Check access works
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Reassign to op_user2
        self.issue.assigned_to = self.op_user2
        self.issue.save()
        
        # Now op_user1's token is reassigned and access is forbidden
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_member_access_with_numeric_id(self):
        # Authenticate as self.admin (tenant1)
        self.client.force_authenticate(user=self.admin)
        url = reverse('operator-task-detail', kwargs={'secure_token': str(self.issue.id)})
        
        # Admin should be allowed to view task
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.issue.id)

    def test_staff_member_access_with_signed_token(self):
        # Generate token for op_user1
        token = signing.dumps({"task_id": self.issue.id, "operator_id": self.op_user1.id})
        url = reverse('operator-task-detail', kwargs={'secure_token': token})
        
        # Deactivate op_user1
        self.op_user1.is_active = False
        self.op_user1.save()
        
        # Reassign to op_user2
        self.issue.assigned_to = self.op_user2
        self.issue.save()
        
        # op_user1 should get 403
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Authenticate as self.admin (same tenant)
        self.client.force_authenticate(user=self.admin)
        # Admin should be allowed to view task even if op_user1 is inactive and task is reassigned
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.issue.id)

    def test_staff_member_cross_tenant_access_denied(self):
        # Generate token for op_user1
        token = signing.dumps({"task_id": self.issue.id, "operator_id": self.op_user1.id})
        url = reverse('operator-task-detail', kwargs={'secure_token': token})
        
        # Authenticate as other_admin (tenant2)
        self.client.force_authenticate(user=self.other_admin)
        
        # Should be forbidden for staff of a different tenant
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Also numeric ID access should fail cross-tenant
        id_url = reverse('operator-task-detail', kwargs={'secure_token': str(self.issue.id)})
        response = self.client.get(id_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

