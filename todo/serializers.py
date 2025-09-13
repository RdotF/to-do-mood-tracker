from rest_framework import serializers
from .models import Task, DailyMood, Mood, Image

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
