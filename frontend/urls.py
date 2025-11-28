from django.urls import path
from .views import index, login, greetings, profile, mood, todo, calendar

urlpatterns = [
  #path("путь", название view, метка названия)
    path('', greetings, name='greetings'),  # Главная страница
    #path('login/', login, name='login'),
    # Другие пути

    path('profile/', profile, name='profile'),
    path('mood/', mood, name='mood'),
    path('todo/', todo , name='todo'),
    path('calendar/', calendar , name='calendar'),

]