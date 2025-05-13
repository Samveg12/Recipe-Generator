from django.test import TestCase, Client
from django.urls import reverse
from core.models import UserProfile, SavedRecipe, CommunityPost, ChatHistory
import json

class IntegrationTests(TestCase):
    def setUp(self):
        # Create test client and user
        self.client = Client()
        self.user_data = {
            "email": "test@example.com",
            "password": "testpass123",
            "first_name": "Test",
            "last_name": "User",
            "age": 25,
            "sex": "M",
            "dietary_preferences": ["vegetarian"],
            "favorite_cuisines": ["italian"]
        }
        
        # Create test user
        self.user = UserProfile(**self.user_data)
        self.user.set_password(self.user_data["password"])
        self.user.save()

    def test_authentication_flow(self):
        # Test invalid login
        response = self.client.post(
            reverse('login'),
            data=json.dumps({"email": "wrong@email.com", "password": "wrongpass"}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)

        # Test valid login
        response = self.client.post(
            reverse('login'),
            data=json.dumps({
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue('token' in response.json())

    def test_chat_functionality(self):
        # Login first
        response = self.client.post(
            reverse('login'),
            data=json.dumps({
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }),
            content_type='application/json'
        )
        token = response.json()['token']
        headers = {'HTTP_AUTHORIZATION': token}

        # Test chat endpoint
        chat_data = {"message": "Generate a pasta recipe"}
        response = self.client.post(
            reverse('chat'),
            data=json.dumps(chat_data),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 200)
        
        # Verify chat history was saved
        self.assertTrue(ChatHistory.objects.filter(user=self.user).exists())

    def test_recipe_management(self):
        # Login and get token
        response = self.client.post(
            reverse('login'),
            data=json.dumps({
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }),
            content_type='application/json'
        )
        token = response.json()['token']
        headers = {'HTTP_AUTHORIZATION': token}

        # Test saving recipe
        recipe_data = {
            "title": "Test Recipe",
            "ingredients": ["ingredient1", "ingredient2"],
            "instructions": "Test instructions"
        }
        response = self.client.post(
            reverse('save_recipe'),
            data=json.dumps(recipe_data),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 200)

        # Test getting saved recipes
        response = self.client.get(
            reverse('get_saved_recipes'),
            **headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

        # Test toggling favorite
        recipe_id = SavedRecipe.objects.first().id
        response = self.client.post(
            reverse('toggle_favorite'),
            data=json.dumps({"id": str(recipe_id), "favorited": True}),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 200)

    def test_community_features(self):
        # Login and get token
        response = self.client.post(
            reverse('login'),
            data=json.dumps({
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }),
            content_type='application/json'
        )
        token = response.json()['token']
        headers = {'HTTP_AUTHORIZATION': token}

        # Create a post
        post_data = {
            "title": "Test Post",
            "content": "Test content"
        }
        response = self.client.post(
            reverse('create_community_post'),
            data=json.dumps(post_data),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 201)

        # Get posts
        response = self.client.get(
            reverse('get_community_posts'),
            **headers
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['posts']), 1)

        # Test post like
        post_id = CommunityPost.objects.first().id
        response = self.client.post(
            reverse('toggle_post_like'),
            data=json.dumps({"post_id": str(post_id)}),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 200)

    def test_profile_management(self):
        # Login and get token
        response = self.client.post(
            reverse('login'),
            data=json.dumps({
                "email": self.user_data["email"],
                "password": self.user_data["password"]
            }),
            content_type='application/json'
        )
        token = response.json()['token']
        headers = {'HTTP_AUTHORIZATION': token}

        # Test getting profile
        response = self.client.get(
            reverse('get_profile'),
            **headers
        )
        self.assertEqual(response.status_code, 200)

        # Test updating profile
        update_data = {
            "dietary_preferences": ["vegan"],
            "favorite_cuisines": ["mexican"],
            "first_name": "Updated"
        }
        response = self.client.put(
            reverse('update_profile'),
            data=json.dumps(update_data),
            content_type='application/json',
            **headers
        )
        self.assertEqual(response.status_code, 200)

        # Verify updates
        user = UserProfile.objects.get(email=self.user_data["email"])
        self.assertEqual(user.dietary_preferences, ["vegan"])
        self.assertEqual(user.favorite_cuisines, ["mexican"])
        self.assertEqual(user.first_name, "Updated")