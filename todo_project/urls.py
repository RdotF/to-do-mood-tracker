
from django.urls import include
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('todo.urls')), # бэк
    path('', include('frontend.urls')),  # Для фронтенда
]
