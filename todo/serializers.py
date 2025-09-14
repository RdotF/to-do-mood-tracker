from rest_framework import serializers
from .models import Task, DailyMood, Mood, Image, User

class MoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mood
        fields = '__all__'

class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class DailyMoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyMood
        fields = '__all__'
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