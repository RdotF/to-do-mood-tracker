import os

from rest_framework import serializers
from .models import Task, DailyMood, Mood, Image, User
from django.contrib.auth.password_validation import validate_password
from django.core.files.images import get_image_dimensions
from django.core.exceptions import ValidationError as DjangoValidationError
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
    avatar_url = serializers.ReadOnlyField()  # Добавляем поле для URL аватара

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'avatar', 'avatar_url']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'write_only': True}  # Сам файл только для записи
        }

    def create(self, validated_data):
        user = User(**validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    def validate_password(self, value):
        from django.contrib.auth.password_validation import validate_password
        validate_password(value)
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует.")
        return value

    def validate_avatar(self, value):
        # Проверка размера файла (максимум 5MB)
        max_size = 5 * 1024 * 1024  # 5MB
        if value.size > max_size:
            raise serializers.ValidationError("Размер файла не должен превышать 5MB.")

        # Проверка формата файла
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in valid_extensions:
            raise serializers.ValidationError("Поддерживаются только файлы JPEG, PNG, GIF и WebP.")

        # Проверка размеров изображения
        try:
            width, height = get_image_dimensions(value)
            if width > 2000 or height > 2000:
                raise serializers.ValidationError("Размер изображения не должен превышать 2000x2000 пикселей.")
            if width < 50 or height < 50:
                raise serializers.ValidationError("Размер изображения должен быть не менее 50x50 пикселей.")
        except DjangoValidationError:
            raise serializers.ValidationError("Некорректный файл изображения.")

        return value