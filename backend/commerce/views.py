"""
Views for commerce — purchasing materials and managing the student library.
Integrates Razorpay for real payment processing.
"""
import os
import hmac
import hashlib
import razorpay

from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt

from .models import Enrollment, Transaction
from .serializers import EnrollmentSerializer, EnrollmentCreateSerializer, TransactionSerializer
from materials.models import Material


# ──────────────────────────────────────────────
# Razorpay client (lazy, uses env vars)
# ──────────────────────────────────────────────
def _razorpay_client():
    key_id = os.getenv('RAZORPAY_KEY_ID', '')
    key_secret = os.getenv('RAZORPAY_KEY_SECRET', '')
    return razorpay.Client(auth=(key_id, key_secret))


# ──────────────────────────────────────────────
# Library
# ──────────────────────────────────────────────
class MyLibraryView(generics.ListAPIView):
    """List all materials the current user has purchased (their library)."""
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(
            user=self.request.user.profile,
            status=Enrollment.Status.ACTIVE,
        ).select_related('material')


# ──────────────────────────────────────────────
# Free purchase (price = 0, no Razorpay needed)
# ──────────────────────────────────────────────
class PurchaseMaterialView(generics.CreateAPIView):
    """
    Purchase a free material (price = 0) — creates Enrollment directly.
    Paid materials must go through Razorpay create-order → verify-payment flow.
    """
    serializer_class = EnrollmentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        material_id = serializer.validated_data['material_id']

        try:
            material = Material.objects.get(pk=material_id, is_approved=True, is_published=True)
        except Material.DoesNotExist:
            return Response({'error': 'Material not found or not available'}, status=status.HTTP_404_NOT_FOUND)

        # Only allow this endpoint for free materials
        if float(material.price) > 0:
            return Response(
                {'error': 'Paid materials must be purchased via Razorpay. Use /commerce/create-order/ first.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if already enrolled
        if Enrollment.objects.filter(user=request.user.profile, material=material).exists():
            return Response({'error': 'You already own this material'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            enrollment = Enrollment.objects.create(
                user=request.user.profile,
                material=material,
                amount_paid=0,
                payment_ref='FREE',
            )
            Transaction.objects.create(
                enrollment=enrollment,
                user=request.user.profile,
                material=material,
                amount=0,
                status=Transaction.TransactionStatus.COMPLETED,
                payment_method='FREE',
                payment_ref='FREE',
            )
            material.total_sales += 1
            material.save(update_fields=['total_sales'])
        except IntegrityError:
            return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'status': 'Enrolled successfully',
            'enrollment_id': str(enrollment.id),
            'material': material.title,
        }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Razorpay — Step 1: Create Order
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_razorpay_order(request):
    """
    Create a Razorpay order for a paid material.
    Frontend calls this first, then opens the Razorpay checkout modal.
    Returns: { order_id, amount, currency, material_id, material_title, key_id }
    """
    material_id = request.data.get('material_id')
    if not material_id:
        return Response({'error': 'material_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        material = Material.objects.get(pk=material_id, is_approved=True, is_published=True)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found or not available'}, status=status.HTTP_404_NOT_FOUND)

    if float(material.price) <= 0:
        return Response({'error': 'This material is free. Use /commerce/purchase/ instead.'}, status=status.HTTP_400_BAD_REQUEST)

    # Check if already purchased
    if Enrollment.objects.filter(user=request.user.profile, material=material).exists():
        return Response({'error': 'You already own this material'}, status=status.HTTP_400_BAD_REQUEST)

    # Amount in paise (Razorpay requires smallest currency unit)
    amount_paise = int(float(material.price) * 100)

    client = _razorpay_client()
    order_data = {
        'amount': amount_paise,
        'currency': 'INR',
        'receipt': f'mat_{str(material_id)[:8]}',  # max 40 chars
        'notes': {
            'material_id': str(material_id),
            'user_id': str(request.user.profile.id),
        },
    }

    try:
        razorpay_order = client.order.create(order_data)
    except Exception as e:
        return Response({'error': f'Failed to create payment order: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Create a PENDING transaction record
    Transaction.objects.create(
        user=request.user.profile,
        material=material,
        amount=material.price,
        status=Transaction.TransactionStatus.PENDING,
        payment_method='RAZORPAY',
        payment_ref=razorpay_order['id'],
    )

    return Response({
        'order_id': razorpay_order['id'],
        'amount': amount_paise,
        'currency': 'INR',
        'material_id': str(material_id),
        'material_title': material.title,
        'key_id': os.getenv('RAZORPAY_KEY_ID', ''),
    })


# ──────────────────────────────────────────────
# Razorpay — Step 2: Verify Payment & Enroll
# ──────────────────────────────────────────────
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_razorpay_payment(request):
    """
    Called by the frontend after Razorpay checkout succeeds.
    Verifies the payment signature (HMAC-SHA256) and creates Enrollment.
    Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, material_id }
    """
    order_id = request.data.get('razorpay_order_id')
    payment_id = request.data.get('razorpay_payment_id')
    signature = request.data.get('razorpay_signature')
    material_id = request.data.get('material_id')

    if not all([order_id, payment_id, signature, material_id]):
        return Response({'error': 'Missing payment details'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify HMAC signature
    key_secret = os.getenv('RAZORPAY_KEY_SECRET', '')
    generated_signature = hmac.new(
        key_secret.encode('utf-8'),
        f'{order_id}|{payment_id}'.encode('utf-8'),
        hashlib.sha256,
    ).hexdigest()

    if generated_signature != signature:
        # Mark pending transaction as failed
        Transaction.objects.filter(payment_ref=order_id).update(
            status=Transaction.TransactionStatus.FAILED
        )
        return Response({'error': 'Payment verification failed — invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    # Signature valid — enroll the user
    try:
        material = Material.objects.get(pk=material_id, is_approved=True, is_published=True)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    if Enrollment.objects.filter(user=request.user.profile, material=material).exists():
        return Response({'error': 'Already enrolled'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        enrollment = Enrollment.objects.create(
            user=request.user.profile,
            material=material,
            amount_paid=material.price,
            payment_ref=payment_id,
        )

        # Update the pending transaction to COMPLETED
        Transaction.objects.filter(payment_ref=order_id, user=request.user.profile).update(
            status=Transaction.TransactionStatus.COMPLETED,
            payment_ref=payment_id,
            enrollment=enrollment,
        )

        material.total_sales += 1
        material.save(update_fields=['total_sales'])

    except IntegrityError:
        return Response({'error': 'Enrollment already exists'}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        'status': 'Payment successful',
        'enrollment_id': str(enrollment.id),
        'material': material.title,
    }, status=status.HTTP_201_CREATED)


# ──────────────────────────────────────────────
# Enrollment Check
# ──────────────────────────────────────────────
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_enrollment(request, material_id):
    """Check if the current user has purchased a specific material."""
    enrolled = Enrollment.objects.filter(
        user=request.user.profile,
        material_id=material_id,
        status=Enrollment.Status.ACTIVE,
    ).exists()
    return Response({'enrolled': enrolled})


# ──────────────────────────────────────────────
# Transaction History
# ──────────────────────────────────────────────
class TransactionHistoryView(generics.ListAPIView):
    """View transaction history for the current user."""
    serializer_class = TransactionSerializer

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user.profile)
