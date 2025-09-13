from django.db import models
from django.contrib.auth.models import User

class Mood(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7)

    def __str__(self):
        return self.name

class Image(models.Model):
    image_url = models.URLField()
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE, related_name='images')

class Task(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

class DailyMood(models.Model):
    date = models.DateField()
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_moods')

    class Meta:
        unique_together = ('date', 'user')  # Уникальность по дате и пользователю
