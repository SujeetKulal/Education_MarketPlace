"""
Serializers for commerce.
"""
from rest_framework import serializers
from .models import Enrollment, Transaction
from materials.serializers import MaterialListSerializer


class EnrollmentSerializer(serializers.ModelSerializer):
    material = MaterialListSerializer(read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'material', 'purchase_date', 'status', 'amount_paid']
        read_only_fields = fields


class EnrollmentCreateSerializer(serializers.Serializer):
    material_id = serializers.UUIDField()
    payment_ref = serializers.CharField(max_length=255, required=False, allow_blank=True)


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'material', 'amount', 'status', 'payment_method', 'payment_ref', 'created_at']
        read_only_fields = fields
