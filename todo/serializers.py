from rest_framework import serializers
from .models import Task, DailyMood, Mood, Image, User
from django.contrib.auth.password_validation import validate_password
class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = ['id', 'name', 'color']

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = ['id', 'image_url', 'mood']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

        extra_kwargs = {
            'user': {'read_only': True},  # 👈 Делаем user только для чтения
            'description': {'required': False, 'allow_blank': True}
        }

class DailyMoodSerializer(serializers.ModelSerializer):
    mood_name = str(serializers.CharField(source='mood.name', read_only=True)).lower()
    mood_image = serializers.SerializerMethodField()
    mood_color = serializers.CharField(source='mood.color', read_only=True)

    class Meta:
        model = DailyMood
        fields = '__all__'
        extra_kwargs = {
            'user': {'read_only': True}
        }

    def get_mood_image(self, obj):
        # Получаем имя файла изображения на основании имени настроения
        mood_name = obj.mood.name.lower() + '.svg'  # предполагаем, что имя файла соответствует названию настроения
        image_url = f'/static/frontend/images/{mood_name}'
        return image_url if any(mood_name) else None
class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}  # Чтобы не возвращать пароль в ответе

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])  # Хешируем пароль перед сохранением
        user.save()
        return user

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value