import os

from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default=None)
    created_at = models.DateTimeField(auto_now=True)
    updated_at = models.DateTimeField(auto_now=True)

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def __str__(self):
        return self.username


    # Свойство для получения URL аватара

    @property
    def avatar_url(self):
        if self.avatar and hasattr(self.avatar, 'url'):
            # Возвращаем относительный путь к аватарке
            return self.avatar.url
        # Возвращаем относительный путь к placeholder
        return '/static/frontend/images/photo-placeholder.svg'
    def get_absolute_avatar_url(self, request):
        """Метод для получения полного URL аватарки с использованием request"""
        if self.avatar and hasattr(self.avatar, 'url'):
            return request.build_absolute_uri(self.avatar.url)
        # Полный URL к placeholder
        return request.build_absolute_uri('/static/frontend/images/photo-placeholder.svg')

    # Метод для удаления старого аватара при загрузке нового
    def save(self, *args, **kwargs):
        if self.pk:
            try:
                old_avatar = User.objects.get(pk=self.pk).avatar
                if old_avatar and old_avatar != self.avatar:
                    if os.path.isfile(old_avatar.path):
                        os.remove(old_avatar.path)
            except User.DoesNotExist:
                pass
        super().save(*args, **kwargs)

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
