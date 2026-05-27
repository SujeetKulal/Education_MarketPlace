"""
Models for user profiles and role management.
"""
import uuid
from django.db import models


class Profile(models.Model):
    """
    User profile linked to Supabase Auth user.
    Stores role, university affiliation, and verification status.
    """

    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        AUTHOR = 'AUTHOR', 'Author'
        ADMIN = 'ADMIN', 'Admin'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    supabase_id = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(blank=True)
    full_name = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.STUDENT)
    university = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    verification_docs_url = models.URLField(blank=True, help_text='URL to uploaded verification documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.full_name or self.email} ({self.role})'

    @property
    def is_author(self):
        return self.role == self.Role.AUTHOR

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def can_publish(self):
        """Authors can only publish if verified."""
        return self.is_author and self.is_verified
