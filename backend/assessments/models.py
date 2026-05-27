"""
Models for MCQ assessments.
"""
import uuid
from django.db import models
from accounts.models import Profile
from materials.models import Material


class MCQ(models.Model):
    """
    MCQ test set linked to a Material of type MCQ.
    Questions are stored as JSONB for flexibility.

    Expected questions format:
    [
        {
            "id": 1,
            "question": "What is Python?",
            "options": ["A language", "A snake", "A framework", "An OS"],
            "correct_answer": 0,
            "explanation": "Python is a programming language."
        },
        ...
    ]
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    material = models.OneToOneField(Material, on_delete=models.CASCADE, related_name='mcq_set')
    questions = models.JSONField(default=list)
    timer_limit = models.PositiveIntegerField(default=30, help_text='Timer limit in minutes')
    passing_score = models.PositiveSmallIntegerField(default=60, help_text='Passing percentage')
    total_questions = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'MCQ Test Set'
        verbose_name_plural = 'MCQ Test Sets'

    def __str__(self):
        return f'MCQ: {self.material.title}'

    def save(self, *args, **kwargs):
        self.total_questions = len(self.questions) if self.questions else 0
        super().save(*args, **kwargs)


class MCQAttempt(models.Model):
    """Records a student's attempt at an MCQ test."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='mcq_attempts')
    mcq = models.ForeignKey(MCQ, on_delete=models.CASCADE, related_name='attempts')
    answers = models.JSONField(default=dict, help_text='Map of question_id to selected_answer')
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    total_correct = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    passed = models.BooleanField(default=False)
    time_taken = models.PositiveIntegerField(default=0, help_text='Time taken in seconds')
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f'{self.user} attempt on {self.mcq} — {self.score}%'
