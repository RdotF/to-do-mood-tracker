from rest_framework import status
from rest_framework.response import Response
from .models import Mood, Image, Task, DailyMood, User
from .serializers import MoodSerializer, ImageSerializer, TaskSerializer, DailyMoodSerializer, CustomUserSerializer
from rest_framework.decorators import api_view


@api_view(['GET', 'POST'])
def mood_list(request):
    if request.method == 'GET':
        moods = Mood.objects.all()
        serializer = MoodSerializer(moods, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = MoodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
@api_view(['GET', 'POST'])
def image_list(request):
    if request.method == 'GET':
        images = Image.objects.all()
        serializer = ImageSerializer(images, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def task_list(request):
    if request.method == 'GET':
        tasks = Task.objects.filter(user=request.user)
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  # Присваиваем текущего пользователя
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
def daily_mood_list(request):
    if request.method == 'GET':
        daily_moods = DailyMood.objects.filter(user=request.user)
        serializer = DailyMoodSerializer(daily_moods, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DailyMoodSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)  
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
def register(request):
    serializer = CustomUserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    try:
          user = User.objects.get(username=username)  # Измените на CustomUser
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

    if user.check_password(password):
        return Response({'message': 'Login successful', 'user_id': user.id}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)



@api_view(['GET'])
def list_users(request):
    users = User.objects.all()  # Получаем всех пользователей
    serializer = CustomUserSerializer(users, many=True)  # Сериализуем пользователей
    return Response(serializer.data, status=status.HTTP_200_OK)  # Возвращаем список пользователей