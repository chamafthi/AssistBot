from django.db import models

# Create your models here.

class Conversation(models.Model):
    user_message = models.TextField()
    bot_reply = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    file_url = models.TextField(null=True, blank=True)  # New field to store file URL or path

    def __str__(self):
        return f"Conversation at {self.timestamp}"