from django.db import models

# Create your models here.
from mongoengine import Document, StringField, ListField, ReferenceField, DateTimeField, BooleanField, IntField
import datetime
import hashlib

class UserProfile(Document):
    email = StringField(required=True, unique=True)
    password = StringField(required=True)  # hash this in real setup
    first_name = StringField()
    last_name = StringField()
    age = IntField()
    sex = StringField()
    dietary_preferences = ListField(StringField())
    favorite_cuisines = ListField(StringField())
    culinary_interests = ListField(StringField())  # Keep as ListField for now to avoid data migration

    meta = {
        'collection': 'user_profile',
        'strict': False
    }
    def set_password(self, raw_password):
        self.password = hashlib.sha256(raw_password.encode()).hexdigest()

    def check_password(self, raw_password):
        return self.password == hashlib.sha256(raw_password.encode()).hexdigest()

class ChatHistory(Document):
    user = ReferenceField(UserProfile)
    prompt = StringField()
    response = StringField()
    timestamp = DateTimeField(default=datetime.datetime.utcnow)

class SavedRecipe(Document):
    user = ReferenceField(UserProfile, required=True)  # ✅ link to user
    title = StringField(required=True)
    ingredients = ListField(StringField())
    instructions = StringField()
    favorited = BooleanField(default=False)
    saved_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'saved_recipes'
    }

class CommunityPost(Document):
    user = ReferenceField(UserProfile, required=True)
    title = StringField(required=True)
    content = StringField(required=True)
    recipe = ReferenceField(SavedRecipe)
    images = ListField(StringField())
    likes = IntField(default=0)
    likes_users = ListField(ReferenceField(UserProfile))
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    updated_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'community_posts',
        'ordering': ['-created_at']
    }

class Comment(Document):
    user = ReferenceField(UserProfile, required=True)
    post = ReferenceField(CommunityPost, required=True)
    content = StringField(required=True)
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'comments',
        'ordering': ['created_at']
    }