from django.test import TestCase, Client
from django.urls import reverse
from core.models import UserProfile
import json

class ErrorCaseTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user_data = {
            "email": "error@test.com",
            "password": "testpass123"
        }

    def test_authentication_errors(self):
        # Test missing fields
        response = self.client.post(
            reverse('signup'),
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

        # Test invalid email format
        response = self.client.post(
            reverse('signup'),
            data=json.dumps({"email": "invalid", "password": "test123"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

        # Test duplicate email
        UserProfile(**self.user_data).save()
        response = self.client.post(
            reverse('signup'),
            data=json.dumps(self.user_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)

    def test_unauthorized_access(self):
        # Try accessing protected endpoint without token
        response = self.client.get(reverse('get_profile'))
        self.assertEqual(response.status_code, 401)

        # Try with invalid token
        response = self.client.get(
            reverse('get_profile'),
            HTTP_AUTHORIZATION='invalid_token'
        )
        self.assertEqual(response.status_code, 401)