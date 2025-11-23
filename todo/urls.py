from django.urls import path
from .views import image_list, task_list, daily_mood_list, mood_list, register, login, list_users

urlpatterns = [
    path('moods/', mood_list, name='mood-list'),
    path('images/', image_list, name='image-list'),
    path('tasks/', task_list, name='task-list'),
    path('daily_mood/', daily_mood_list, name='daily-mood-list'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('users/', list_users, name='list_users')
    
]