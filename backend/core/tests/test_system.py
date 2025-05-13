import unittest
import requests
import json

class SystemTests(unittest.TestCase):
    BASE_URL = 'http://localhost:8000/api'
    
    def setUp(self):
        self.session = requests.Session()
        self.user_data = {
            "email": "system@test.com",
            "password": "testpass123",
            "first_name": "System",
            "last_name": "Test"
        }
        
    def test_complete_system(self):
        # 1. Test API availability
        response = self.session.get(f'{self.BASE_URL}/health-check/')
        self.assertEqual(response.status_code, 200)
        
        # 2. Test registration
        response = self.session.post(
            f'{self.BASE_URL}/signup/',
            json=self.user_data
        )
        self.assertEqual(response.status_code, 200)
        
        # 3. Test login and token acquisition
        response = self.session.post(
            f'{self.BASE_URL}/login/',
            json={
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }
        )
        self.assertEqual(response.status_code, 200)
        token = response.json()['token']
        self.session.headers.update({'Authorization': token})
        
        # 4. Test recipe generation
        response = self.session.post(
            f'{self.BASE_URL}/chat/',
            json={"prompt": "Generate a simple pasta recipe"}
        )
        self.assertEqual(response.status_code, 200)