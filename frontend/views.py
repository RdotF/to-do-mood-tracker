from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'frontend/index.html') 

def login(request):
    return render(request, 'frontend/login.html') 

def greetings(request):
    return render(request, 'frontend/greetings.html')

def profile(request):
    return render(request, 'frontend/profile.html')

def mood(request):
    return render(request, 'frontend/mood.html')

def todo(request):
    return render(request, 'frontend/todo.html')

def calendar(request):
    return render(request, 'frontend/calendar.html')