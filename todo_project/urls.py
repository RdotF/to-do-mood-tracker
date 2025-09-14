
from django.urls import include
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('todo.urls')), # бэк
    path('', TemplateView.as_view(template_name='frontend/index.html'), name='home'),  # Главная страница
    path('', include('frontend.urls')),  # Для фронтенда
]
