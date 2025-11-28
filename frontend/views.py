import locale
from datetime import date

from django.shortcuts import render, redirect




# Create your views here.
def index(request):
    return render(request, 'frontend/index.html') 

def login(request):
    return render(request, 'frontend/login.html') 

def greetings(request):
    return render(request, 'frontend/greetings.html')

def profile(request):
    # Проверяем авторизацию через сессии
    user_id = request.session.get('user_id')
    print(f"Session user_id: {user_id}")  # Для отладки
    print(f"Session keys: {list(request.session.keys())}")  # Для отладки

    if not user_id:
        return redirect('/')  # Перенаправляем на главную если не авторизован

    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        from todo.models import User
        user = User.objects.get(id=user_id)
        print(f"Found user: {user}")  # Для отладки
        user_data = {
            'username': user.username,
            'email': user.email,
            'user_id': user.id,
        }
        return render(request, 'frontend/profile.html', user_data)
    except Exception as e:
        print(f"Error: {e}")  # Для отладки
        return redirect('/')
def mood(request):
    user_id = request.session.get('user_id')
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from todo.models import User
    user = User.objects.get(id=user_id)
    print(f"Found user: {user}")  # Для отладки
    user_data = {
        'username': user.username,
        'email': user.email,
        'user_id': user.id,
    }
    return render(request, 'frontend/mood.html', user_data)

def todo(request):
    return render(request, 'frontend/todo.html')

def calendar(request):
    return render(request, 'frontend/calendar.html')