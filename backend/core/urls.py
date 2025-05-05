from django.urls import path
from .views import chat, signup_view, login_view, get_history, save_recipe, get_saved_recipes, toggle_favorite, get_favorites

urlpatterns = [
    path('chat/', chat),
    path('signup/', signup_view),
    path('login/', login_view),
    path('history/', get_history),
    path('save-recipe/', save_recipe),
    path('saved-recipes/', get_saved_recipes),
    path('toggle-favorite/', toggle_favorite),
    path('favorites/', get_favorites),
]
