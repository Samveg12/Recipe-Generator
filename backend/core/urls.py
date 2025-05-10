from django.urls import path
from .views import chat, signup_view, login_view, get_history, save_recipe, get_saved_recipes, toggle_favorite, get_favorites, get_community_posts, create_community_post, get_post_details, add_comment, toggle_post_like, delete_recipe

urlpatterns = [
    path('chat/', chat),
    path('signup/', signup_view),
    path('login/', login_view),
    path('history/', get_history),
    path('save-recipe/', save_recipe),
    path('saved-recipes/', get_saved_recipes),
    path('toggle-favorite/', toggle_favorite),
    path('favorites/', get_favorites),
    path('delete-recipe/', delete_recipe),
    path('community/posts/', get_community_posts),
    path('community/posts/create/', create_community_post),
    path('community/posts/<str:post_id>/', get_post_details),
    path('community/comments/add/', add_comment),
    path('community/posts/like/', toggle_post_like),
]
