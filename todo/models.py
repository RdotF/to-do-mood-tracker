from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username

class Mood(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7)

    def __str__(self):
        return self.name

class Image(models.Model):
    image_url = models.URLField()
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE, related_name='images')

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    due_date = models.DateField()
    is_completed = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')

class DailyMood(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateField()
    mood = models.ForeignKey(Mood, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_moods')

    class Meta:
        unique_together = ('date', 'user')  # Уникальность по дате и пользователю
