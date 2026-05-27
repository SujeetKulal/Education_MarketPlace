"""
Models for educational materials and content.
"""
import uuid
from django.db import models
from accounts.models import Profile


class Material(models.Model):
    """
    Represents an educational material — PDF, Video, or MCQ test set.
    Uploaded by verified authors and sold to students.
    """

    class MaterialType(models.TextChoices):
        PDF = 'PDF', 'PDF E-book'
        VIDEO = 'VIDEO', 'Video Lesson'
        MCQ = 'MCQ', 'MCQ Test Set'

    class DifficultyLevel(models.TextChoices):
        BEGINNER = 'Beginner', 'Beginner'
        INTERMEDIATE = 'Intermediate', 'Intermediate'
        ADVANCED = 'Advanced', 'Advanced'
        BEGINNER_INTERMEDIATE = 'Beginner to Intermediate', 'Beginner to Intermediate'
        ALL_LEVELS = 'All Levels', 'All Levels'

    class Category(models.TextChoices):
        MANAGEMENT = 'Management', 'Management'
        FINANCE = 'Finance', 'Finance'
        MARKETING = 'Marketing', 'Marketing'
        HUMAN_RESOURCES = 'Human Resources', 'Human Resources'
        OPERATIONS = 'Operations', 'Operations'
        INFORMATION_TECHNOLOGY = 'Information Technology', 'Information Technology'
        ENTREPRENEURSHIP = 'Entrepreneurship', 'Entrepreneurship'
        ENGINEERING = 'Engineering', 'Engineering'
        SCIENCE = 'Science', 'Science'
        ARTS = 'Arts', 'Arts'
        SOCIAL_SCIENCES = 'Social Sciences', 'Social Sciences'
        BUSINESS = 'Business', 'Business'
        LAW = 'Law', 'Law'
        MEDICINE = 'Medicine', 'Medicine'
        PHARMACY = 'Pharmacy', 'Pharmacy'
        OTHER = 'Other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='materials')
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=5, choices=MaterialType.choices)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    file_path = models.CharField(max_length=1000, blank=True, help_text='Path in Supabase private bucket')
    thumbnail_url = models.URLField(blank=True, help_text='Public thumbnail URL')
    university = models.CharField(max_length=255, blank=True, db_index=True)
    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        blank=True,
        db_index=True,
    )
    course = models.CharField(max_length=255, blank=True, db_index=True)
    semester = models.CharField(max_length=50, blank=True, db_index=True)
    tags = models.JSONField(default=list, blank=True)
    page_count = models.PositiveIntegerField(null=True, blank=True)
    topics_covered = models.PositiveIntegerField(null=True, blank=True)
    level = models.CharField(
        max_length=50,
        choices=DifficultyLevel.choices,
        blank=True,
    )
    language = models.CharField(max_length=50, default='English', blank=True)
    file_size_bytes = models.PositiveBigIntegerField(null=True, blank=True)
    about_material = models.TextField(
        blank=True,
        help_text='Detailed description and context shown on the material page',
    )
    is_approved = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    total_sales = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['university', 'semester']),
            models.Index(fields=['type', 'is_approved']),
        ]

    def __str__(self):
        return f'{self.title} ({self.type}) by {self.author}'


class MaterialReview(models.Model):
    """Student reviews for materials."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['material', 'user']
        ordering = ['-created_at']

    def __str__(self):
        return f'Review by {self.user} for {self.material} ({self.rating}★)'
