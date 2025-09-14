from django.urls import path
from .views import index, login

urlpatterns = [
  #path("путь", название view, метка названия)
    path('', index, name='index'),  # Главная страница
    path('login/', login, name='login')
    # Другие пути
]