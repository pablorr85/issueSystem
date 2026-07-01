import uuid
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
        self.assertIn(f"task/{self.issue.id}?token={self.issue.secure_token}", sent_message['body'])
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





