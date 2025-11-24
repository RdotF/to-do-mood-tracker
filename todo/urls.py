from django.urls import path
from .views import image_list, task_list, daily_mood_list, mood_list, register, login, list_users, logout, \
    create_session, task_detail

urlpatterns = [
    path('moods/', mood_list, name='mood-list'),
    path('images/', image_list, name='image-list'),
    path('tasks/', task_list, name='task-list'),
    path('tasks/<int:pk>/', task_detail, name='task_detail'),
    path('daily_mood/', daily_mood_list, name='daily-mood-list'),
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('users/', list_users, name='list_users'),
    path('logout/', logout, name='logout'),
    path('create-session/', create_session, name='create_session'),
]