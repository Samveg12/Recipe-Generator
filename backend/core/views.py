from django.shortcuts import render
import os
from dotenv import load_dotenv
import jwt
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ChatHistory, UserProfile, SavedRecipe, CommunityPost, Comment
from openai import OpenAI
from .auth import verify_token
import datetime
import os
from django.views.decorators.csrf import csrf_exempt
import json
import re
import hashlib
from django.http import JsonResponse

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

@csrf_exempt
def get_community_posts(request):
    if request.method == 'GET':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'No token provided'}, status=401)
            
            # Verify token and get user
            email = verify_token(token)
            if not email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
            
            user = UserProfile.objects(email=email).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Get all community posts with user info
            posts = []
            for post in CommunityPost.objects.all():
                post_data = {
                    'id': str(post.id),
                    'title': post.title,
                    'content': post.content,
                    'likes': post.likes,
                    'created_at': post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    'user_email': post.user.email,
                    'user_id': str(post.user.id),
                    'liked_by_current_user': user in post.likes_users,
                    'comments_count': Comment.objects(post=post).count()
                }
                
                if post.recipe:
                    post_data['recipe'] = {
                        'id': str(post.recipe.id),
                        'title': post.recipe.title
                    }
                    
                posts.append(post_data)
                
            return JsonResponse({'posts': posts}, status=200)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def create_community_post(request):
    if request.method == 'POST':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'No token provided'}, status=401)
            
            # Verify token and get user
            email = verify_token(token)
            if not email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
            
            user = UserProfile.objects(email=email).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Parse request data
            data = json.loads(request.body)
            title = data.get('title')
            content = data.get('content')
            recipe_id = data.get('recipe_id')
            
            if not title or not content:
                return JsonResponse({'error': 'Title and content are required'}, status=400)
            
            # Create new post
            post = CommunityPost(
                user=user,
                title=title,
                content=content
            )
            
            # Add recipe if provided
            if recipe_id:
                try:
                    recipe = SavedRecipe.objects.get(id=recipe_id)
                    post.recipe = recipe
                except:
                    pass  # Continue without recipe if not found
            
            post.save()
            
            return JsonResponse({
                'success': True,
                'post_id': str(post.id)
            }, status=201)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_post_details(request, post_id):
    if request.method == 'GET':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'No token provided'}, status=401)
            
            # Verify token and get user
            email = verify_token(token)
            if not email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
            
            user = UserProfile.objects(email=email).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Get post with details
            try:
                post = CommunityPost.objects.get(id=post_id)
                
                # Get comments
                comments = []
                for comment in Comment.objects(post=post):
                    comments.append({
                        'id': str(comment.id),
                        'content': comment.content,
                        'created_at': comment.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                        'user_email': comment.user.email,
                        'user_id': str(comment.user.id)
                    })
                
                # Create response
                post_data = {
                    'id': str(post.id),
                    'title': post.title,
                    'content': post.content,
                    'likes': post.likes,
                    'created_at': post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    'user_email': post.user.email,
                    'user_id': str(post.user.id),
                    'liked_by_current_user': user in post.likes_users,
                    'comments': comments
                }
                
                if post.recipe:
                    post_data['recipe'] = {
                        'id': str(post.recipe.id),
                        'title': post.recipe.title,
                        'ingredients': post.recipe.ingredients,
                        'instructions': post.recipe.instructions
                    }
                    
                return JsonResponse({'post': post_data}, status=200)
                
            except CommunityPost.DoesNotExist:
                return JsonResponse({'error': 'Post not found'}, status=404)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def add_comment(request):
    if request.method == 'POST':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'No token provided'}, status=401)
            
            # Verify token and get user
            email = verify_token(token)
            if not email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
            
            user = UserProfile.objects(email=email).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Parse request data
            data = json.loads(request.body)
            post_id = data.get('post_id')
            content = data.get('content')
            
            if not post_id or not content:
                return JsonResponse({'error': 'Post ID and content are required'}, status=400)
            
            # Get post
            try:
                post = CommunityPost.objects.get(id=post_id)
                
                # Create comment
                comment = Comment(
                    user=user,
                    post=post,
                    content=content
                )
                comment.save()
                
                return JsonResponse({
                    'success': True,
                    'comment_id': str(comment.id),
                    'user_email': user.email,
                    'created_at': comment.created_at.strftime("%Y-%m-%d %H:%M:%S")
                }, status=201)
                
            except CommunityPost.DoesNotExist:
                return JsonResponse({'error': 'Post not found'}, status=404)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def toggle_post_like(request):
    if request.method == 'POST':
        try:
            token = request.headers.get('Authorization')
            if not token:
                return JsonResponse({'error': 'No token provided'}, status=401)
            
            # Verify token and get user
            email = verify_token(token)
            if not email:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)
            
            user = UserProfile.objects(email=email).first()
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)
            
            # Parse request data
            data = json.loads(request.body)
            post_id = data.get('post_id')
            
            if not post_id:
                return JsonResponse({'error': 'Post ID is required'}, status=400)
            
            # Get post
            try:
                post = CommunityPost.objects.get(id=post_id)
                
                # Toggle like
                liked = False
                if user in post.likes_users:
                    post.likes_users.remove(user)
                    post.likes -= 1
                else:
                    post.likes_users.append(user)
                    post.likes += 1
                    liked = True
                
                post.save()
                
                return JsonResponse({
                    'success': True,
                    'liked': liked,
                    'likes_count': post.likes
                }, status=200)
                
            except CommunityPost.DoesNotExist:
                return JsonResponse({'error': 'Post not found'}, status=404)
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
def delete_recipe(request):
    token = request.headers.get('Authorization')
    email = verify_token(token)
    if not email:
        return Response({'error': 'Invalid token'}, status=401)

    user = UserProfile.objects(email=email).first()
    if not user:
        return Response({'error': 'User not found'}, status=404)

    recipe_id = request.data.get('id')
    if not recipe_id:
        return Response({'error': 'Recipe ID is required'}, status=400)

    try:
        recipe = SavedRecipe.objects.get(id=recipe_id, user=user)
        recipe.delete()
        return Response({'message': 'Recipe deleted successfully'})
    except SavedRecipe.DoesNotExist:
        return Response({'error': 'Recipe not found or you do not have permission to delete it'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
