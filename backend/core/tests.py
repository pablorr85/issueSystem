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

