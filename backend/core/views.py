from django.shortcuts import render
import os
from dotenv import load_dotenv
import jwt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ChatHistory, UserProfile, SavedRecipe
from openai import OpenAI
from .auth import verify_token
import datetime
import os

load_dotenv()
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")  # Ensure your API key is stored securely
)


@api_view(['POST'])
def chat(request):
    token = request.headers.get('Authorization')
    if not token:
        return Response({'error': 'Authorization token missing'}, status=401)

    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid or expired token'}, status=401)

    user = UserProfile.objects(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    message = request.data.get('message')
    if not message:
        return Response({'error': 'Message is required'}, status=400)

    try:
        # Send to OpenAI
        completion = client.chat.completions.create(
        model="gpt-4o-mini",
        store=True,
        messages=[
                {
                    "role": "system",
                    "content": "You are a helpful recipe assistant who helps users find recipes based on their needs and preferences."
                },
                {
                    "role": "user",
                    "content": f"I have these ingredients: {message}. Please suggest a complete recipe using them. Include the recipe name, a list of ingredients, and step-by-step cooking instructions."
                }
            ]
        )
        reply = completion.choices[0].message.content

        # Save to DB
        ChatHistory(
            user=user,
            prompt=message,
            response=reply,
            timestamp=datetime.datetime.utcnow()
        ).save()

        return Response({'reply': reply})

    except Exception as e:
        print(e)
        return Response({'error': 'Failed to generate recipe'}, status=500)
    

@api_view(['POST'])
def signup_view(request):
    data = request.data
    email = data.get('email')
    password = data.get('password')

    if UserProfile.objects(email=email).first():
        return Response({'error': 'User already exists'}, status=400)

    user = UserProfile(
        email=email,
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        age=data.get('age'),
        sex=data.get('sex'),
        dietary_preferences=data.get('dietary_preferences', []),
        favorite_cuisines=data.get('favorite_cuisines', []),
        culinary_interests=data.get('culinary_interests', [])
    )
    user.set_password(password)
    user.save()
    return Response({'message': 'User registered successfully'})

from .auth import generate_token

@api_view(['POST'])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    user = UserProfile.objects(email=email).first()
    if user and user.check_password(password):
        token = generate_token(email)
        return Response({'message': 'Login successful', 'token': token})
    else:
        return Response({'error': 'Invalid credentials'}, status=401)

@api_view(['GET'])
def get_history(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    user = UserProfile.objects(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    history = ChatHistory.objects(user=user).order_by('-timestamp')  # newest first

    result = [
        {
            "prompt": entry.prompt,
            "response": entry.response,
            "timestamp": entry.timestamp
        }
        for entry in history
    ]
    return Response(result)

@api_view(['POST'])
def save_recipe(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    user = UserProfile.objects(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    data = request.data
    recipe = SavedRecipe(
        user=user,
        title=data.get('title'),
        ingredients=data.get('ingredients', []),
        instructions=data.get('instructions', ''),
        favorited=data.get('favorited', False)
    )
    recipe.save()
    return Response({'message': 'Recipe saved successfully'})


@api_view(['GET'])
def get_saved_recipes(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    user = UserProfile.objects(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    recipes = SavedRecipe.objects(user=user).order_by('-saved_at')
    data = [
        {
            "id": str(r.id),
            "title": r.title,
            "ingredients": r.ingredients,
            "instructions": r.instructions,
            "favorited": r.favorited
        }
        for r in recipes
    ]
    return Response(data)


@api_view(['POST'])
def toggle_favorite(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    recipe_id = request.data.get('id')
    favorite_status = request.data.get('favorited', True)

    recipe = SavedRecipe.objects(id=recipe_id).first()
    if not recipe:
        return Response({'error': 'Recipe not found'}, status=404)

    recipe.favorited = favorite_status
    recipe.save()

    return Response({'message': 'Recipe updated', 'favorited': recipe.favorited})


def get_favorites(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    user = UserProfile.objects(email=email).first()
    recipes = SavedRecipe.objects(user=user, favorited=True)
    data = [
        {
            "id": str(r.id),
            "title": r.title,
            "ingredients": r.ingredients,
            "instructions": r.instructions
        }
        for r in recipes
    ]
    return Response(data)
