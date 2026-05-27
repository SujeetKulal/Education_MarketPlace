"""
Models for commerce — enrollments and payment tracking.
"""
import uuid
from django.db import models
from accounts.models import Profile
from materials.models import Material


class Enrollment(models.Model):
    """
    Tracks a student's purchase/enrollment in a material.
    Created after successful payment.
    """

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        EXPIRED = 'EXPIRED', 'Expired'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='enrollments')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='enrollments')
    purchase_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ACTIVE)
    payment_ref = models.CharField(max_length=255, blank=True, help_text='External payment reference ID')
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    class Meta:
        unique_together = ['user', 'material']
        ordering = ['-purchase_date']

    def __str__(self):
        return f'{self.user} enrolled in {self.material}'


class Transaction(models.Model):
    """
    Detailed payment transaction log.
    """

    class TransactionStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        REFUNDED = 'REFUNDED', 'Refunded'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    user = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='transactions')
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=TransactionStatus.choices, default=TransactionStatus.PENDING)
    payment_method = models.CharField(max_length=50, blank=True)
    payment_ref = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Transaction {self.id} - {self.status}'
