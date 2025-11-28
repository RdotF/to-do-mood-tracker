from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import Mood, Image, Task, DailyMood, User
from .serializers import MoodSerializer, ImageSerializer, TaskSerializer, DailyMoodSerializer, CustomUserSerializer
from rest_framework.decorators import api_view, parser_classes


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
        # Получаем пользователя из сессии
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=user_id)
            tasks = Task.objects.filter(user=user)
            serializer = TaskSerializer(tasks, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=user_id)
            # Создаем копию данных и добавляем пользователя
            data = request.data.copy()

            serializer = TaskSerializer(data=data)
            if serializer.is_valid():
                # Сохраняем с текущим пользователем
                serializer.save(user=user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'PATCH', 'DELETE'])
def task_detail(request, pk):
    # Получаем пользователя из сессии
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
        # Ищем задачу по ID и фильтруем по пользователю
        task = Task.objects.get(pk=pk, user=user)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = TaskSerializer(task)
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = TaskSerializer(task, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'POST'])
def daily_mood_list(request):
    if request.method == 'GET':
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=user_id)
            daily_moods = DailyMood.objects.filter(user=user)
            serializer = DailyMoodSerializer(daily_moods, many=True)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    elif request.method == 'POST':
        user_id = request.session.get('user_id')
        if not user_id:
            return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=user_id)

            # Проверяем, существует ли уже запись для этой даты и пользователя
            date = request.data.get('date')
            existing_mood = DailyMood.objects.filter(user=user, date=date).first()

            if existing_mood:
                # Если запись уже существует, обновляем её
                serializer = DailyMoodSerializer(existing_mood, data=request.data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Если записи нет, создаём новую
                serializer = DailyMoodSerializer(data=request.data)
                if serializer.is_valid():
                    serializer.save(user=user)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception:
            return Response({'error': 'Mood entry already exists for this date and user'},
                            status=status.HTTP_400_BAD_REQUEST)
    

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

    # Проверяем обязательные поля
    if not username or not password:
        return Response(
            {'error': 'Логин и пароль обязательны для заполнения'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Проверяем существование пользователя
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {'error': 'Пользователь с таким логином не найден'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Проверяем пароль с помощью вашего метода check_password
    if user.check_password(password):
        request.session['user_id'] = user.id
        request.session['username'] = user.username
        request.session['email'] = user.email

        request.session.save()
        print(f"Session created for user: {user.id}")
        return Response({
            'message': 'Вход выполнен успешно',
            'user_id': user.id,
            'username': user.username
        }, status=status.HTTP_200_OK)
    else:
        return Response(
            {'error': 'Неверный пароль'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
def logout(request):
    # Очищаем сессию
    request.session.flush()
    return Response({'message': 'Выход выполнен успешно'}, status=status.HTTP_200_OK)
@api_view(['GET'])
def list_users(request):
    users = User.objects.all()  # Получаем всех пользователей
    serializer = CustomUserSerializer(users, many=True)  # Сериализуем пользователей
    return Response(serializer.data, status=status.HTTP_200_OK)  # Возвращаем список пользователей


@api_view(['POST'])
def create_session(request):
    user_id = request.data.get('user_id')
    if not user_id:
        return Response({'error': 'User ID required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        request.session['user_id'] = user.id
        request.session['username'] = user.username
        request.session['email'] = user.email
        return Response({'message': 'Session created successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET', 'PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser])
def user_profile(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'avatar_url': user.get_absolute_avatar_url(request),
            # Используем метод с request
        }
        return Response(data)

    elif request.method == 'PATCH':
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']
            user.save()

            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'avatar_url': user.get_absolute_avatar_url(request)  # Используем метод с request
            }
            return Response(data)
        else:
            return Response({'error': 'No avatar file provided'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def daily_mood_detail(request, pk):
    """
    Retrieve, update or delete a daily mood instance.
    """
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
        daily_mood = DailyMood.objects.get(pk=pk, user=user)
    except DailyMood.DoesNotExist:
        return Response({'error': 'Daily mood not found'}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DailyMoodSerializer(daily_mood)
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = DailyMoodSerializer(daily_mood, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        daily_mood.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
@api_view(['DELETE'])
def delete_avatar(request):
    user_id = request.session.get('user_id')
    if not user_id:
        return Response({'error': 'User not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        user = User.objects.get(id=user_id)
        if user.avatar:
            # Удаляем файл аватара
            user.avatar.delete(save=False)
            user.avatar = None
            user.save()
            return Response({'message': 'Аватар удален'})
        return Response({'message': 'Аватар уже отсутствует'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)