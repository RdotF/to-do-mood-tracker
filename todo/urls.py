from django.urls import path
from .views import TaskViewSet, DailyMoodViewSet, MoodViewSet, ImageViewSet

urlpatterns = [
    path('tasks/', TaskViewSet.as_view({'get': 'list', 'post': 'create'}), name='task-list'),
    path('tasks/<int:pk>/', TaskViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='task-detail'),
    
    path('daily_moods/', DailyMoodViewSet.as_view({'get': 'list', 'post': 'create'}), name='daily-mood-list'),
    path('daily_moods/<int:pk>/', DailyMoodViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='daily-mood-detail'),
    
    path('moods/', MoodViewSet.as_view({'get': 'list', 'post': 'create'}), name='mood-list'),
    path('moods/<int:pk>/', MoodViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='mood-detail'),
    
    path('images/', ImageViewSet.as_view({'get': 'list', 'post': 'create'}), name='image-list'),
    path('images/<int:pk>/', ImageViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='image-detail'),
]
