from django.urls import path
from .views import index, login, greetings, profile, mood, todo, calendar

urlpatterns = [
  #path("путь", название view, метка названия)
    path('', index, name='index'),  # Главная страница
    path('login/', login, name='login'),
    # Другие пути

    path('greetings/', greetings, name='greetings'),
    path('profile/', profile, name='profile'),
    path('mood/', mood, name='mood'),
    path('todo/', todo , name='todo'),
    path('calendar/', calendar , name='calendar'),

]