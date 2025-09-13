from rest_framework import viewsets
from .models import Task, DailyMood, Mood, Image
from .serializers import TaskSerializer, DailyMoodSerializer, MoodSerializer, ImageSerializer
from rest_framework.permissions import IsAuthenticated

class MoodViewSet(viewsets.ModelViewSet):
    queryset = Mood.objects.all()
    serializer_class = MoodSerializer

class ImageViewSet(viewsets.ModelViewSet):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

class DailyMoodViewSet(viewsets.ModelViewSet):
    serializer_class = DailyMoodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyMood.objects.filter(user=self.request.user)
