from django.test import TestCase, Client
from django.urls import reverse
from .models import UserProfile, SavedRecipe, CommunityPost, Comment
import json
from .auth import generate_token

class APITestCase(TestCase):
    def setUp(self):
        # Create test client
        self.client = Client()
        
        # Ensure no residual documents exist that could cause unique‑key conflicts
        UserProfile.objects.delete()
        SavedRecipe.objects.delete()
        CommunityPost.objects.delete()
        Comment.objects.delete()
        
        # Create test user
        self.test_user = UserProfile(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            age=25,
            sex="M",
            dietary_preferences=["vegetarian"],
            favorite_cuisines=["italian"],
            culinary_interests=["baking"]
        )
        self.test_user.set_password("testpass123")
        self.test_user.save()
        
        # Generate token for test user
        self.token = generate_token(self.test_user.email)
        self.headers = {'HTTP_AUTHORIZATION': self.token}

    def test_signup(self):
        data = {
            "email": "newuser@example.com",
            "password": "newpass123",
            "first_name": "New",
            "last_name": "User",
            "age": 30,
            "sex": "F",
            "dietary_preferences": ["vegan"],
            "favorite_cuisines": ["mexican"],
            "culinary_interests": ["grilling"]
        }
        response = self.client.post(
            reverse('signup'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(UserProfile.objects(email="newuser@example.com").first())

    def test_login(self):
        data = {
            "email": "test@example.com",
            "password": "testpass123"
        }
        response = self.client.post(
            reverse('login'),
            data=json.dumps(data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue('token' in response.json())

    def test_profile_get(self):
        response = self.client.get(
            reverse('get_profile'),
            **self.headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['email'], self.test_user.email)
        self.assertEqual(data['first_name'], self.test_user.first_name)

    def test_profile_update(self):
        update_data = {
            "first_name": "Updated",
            "dietary_preferences": ["keto"],
            "age": 26
        }
        response = self.client.put(
            reverse('update_profile'),
            data=json.dumps(update_data),
            content_type='application/json',
            **self.headers
        )
        self.assertEqual(response.status_code, 200)
        updated_user = UserProfile.objects(email=self.test_user.email).first()
        self.assertEqual(updated_user.first_name, "Updated")
        self.assertEqual(updated_user.dietary_preferences, ["keto"])
        self.assertEqual(updated_user.age, 26)

    def test_save_recipe(self):
        recipe_data = {
            "title": "Test Recipe",
            "ingredients": ["ingredient1", "ingredient2"],
            "instructions": "Test instructions",
            "favorited": False
        }
        response = self.client.post(
            reverse('save_recipe'),
            data=json.dumps(recipe_data),
            content_type='application/json',
            **self.headers
        )
        self.assertEqual(response.status_code, 200)
        saved_recipe = SavedRecipe.objects(user=self.test_user).first()
        self.assertEqual(saved_recipe.title, "Test Recipe")

    def test_get_saved_recipes(self):
        # Create test recipe first
        recipe = SavedRecipe(
            user=self.test_user,
            title="Test Recipe",
            ingredients=["test1", "test2"],
            instructions="Test instructions"
        ).save()

        response = self.client.get(
            reverse('get_saved_recipes'),
            **self.headers
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['title'], "Test Recipe")

    def test_create_community_post(self):
        post_data = {
            "title": "Test Post",
            "content": "Test content"
        }
        response = self.client.post(
            reverse('create_community_post'),
            data=json.dumps(post_data),
            content_type='application/json',
            **self.headers
        )
        self.assertEqual(response.status_code, 201)
        post = CommunityPost.objects(user=self.test_user).first()
        self.assertEqual(post.title, "Test Post")


    def tearDown(self):
        # Clean up created objects
        UserProfile.objects.delete()
        SavedRecipe.objects.delete()
        CommunityPost.objects.delete()
        Comment.objects.delete()