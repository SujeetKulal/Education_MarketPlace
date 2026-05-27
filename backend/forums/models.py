"""
Models for community forums with threaded discussions.
"""
import uuid
from django.db import models
from accounts.models import Profile
from materials.models import Material


class ForumPost(models.Model):
    """
    Forum post supporting threaded discussions.
    Can optionally be linked to a material for topic-specific forums.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='forum_posts')
    material = models.ForeignKey(
        Material, on_delete=models.CASCADE,
        related_name='forum_posts', null=True, blank=True,
        help_text='Optional material link for topic-specific discussions'
    )
    title = models.CharField(max_length=500, blank=True, help_text='Title for top-level posts')
    content = models.TextField()
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE,
        related_name='replies', null=True, blank=True,
        help_text='Parent post for threaded replies'
    )
    class PostType(models.TextChoices):
        QUESTION = 'QUESTION', 'Question'
        DISCUSSION = 'DISCUSSION', 'Discussion'

    class Topic(models.TextChoices):
        GENERAL = 'General Discussion', 'General Discussion'
        BOOKS = 'Books & Resources', 'Books & Resources'
        STUDY = 'Study Materials', 'Study Materials'
        EXAM = 'Exam Preparation', 'Exam Preparation'

    post_type = models.CharField(
        max_length=12,
        choices=PostType.choices,
        default=PostType.DISCUSSION,
    )
    topic = models.CharField(
        max_length=50,
        choices=Topic.choices,
        default=Topic.GENERAL,
    )
    is_pinned = models.BooleanField(default=False)
    likes_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return f'{self.title or "Reply"} by {self.user}'

    @property
    def is_reply(self):
        return self.parent is not None




class PostLike(models.Model):
    """Tracks likes on forum posts."""
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='post_likes')
    post = models.ForeignKey(ForumPost, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'post']
