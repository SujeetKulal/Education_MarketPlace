"""
Views for materials — marketplace browsing, author CRUD, and admin moderation.
"""
import requests
from datetime import datetime
from django.http import HttpResponse
from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Avg

from .models import Material, MaterialReview
from .serializers import (
    MaterialListSerializer, MaterialDetailSerializer,
    MaterialCreateSerializer, MaterialAdminSerializer,
    MaterialReviewSerializer,
)
from .storage import generate_signed_url
from accounts.permissions import IsVerifiedAuthor, IsAdmin, IsOwnerOrAdmin

try:
    import fitz  # PyMuPDF
except Exception:  # pragma: no cover
    fitz = None


def _user_has_material_access(user, material):
    from commerce.models import Enrollment

    has_access = Enrollment.objects.filter(
        user=user.profile,
        material=material,
        status='ACTIVE',
    ).exists()
    if material.author == user.profile:
        has_access = True
    if user.profile.role == 'ADMIN':
        has_access = True
    return has_access


# ────────────────────────────────────────
# PUBLIC MARKETPLACE (Phase 3)
# ────────────────────────────────────────

class MarketplaceListView(generics.ListAPIView):
    """
    Public marketplace listing with filtering by university, course, semester, type.
    """
    serializer_class = MaterialListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = Material.objects.filter(is_approved=True, is_published=True)

        # Filtering
        university = self.request.query_params.get('university')
        category = self.request.query_params.get('category')
        course = self.request.query_params.get('course')
        semester = self.request.query_params.get('semester')
        material_type = self.request.query_params.get('type')
        search = self.request.query_params.get('search')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        sort_by = self.request.query_params.get('sort', '-created_at')

        if university:
            qs = qs.filter(university__icontains=university)
        if category:
            qs = qs.filter(category=category)
        if course:
            qs = qs.filter(course__icontains=course)
        if semester:
            qs = qs.filter(semester=semester)
        if material_type:
            qs = qs.filter(type=material_type.upper())
        if search:
            qs = qs.filter(title__icontains=search)
        level = self.request.query_params.get('level')
        if level:
            qs = qs.filter(level=level)
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)

        # Sorting
        valid_sorts = ['price', '-price', 'created_at', '-created_at', 'average_rating', '-average_rating', 'total_sales', '-total_sales']
        if sort_by in valid_sorts:
            qs = qs.order_by(sort_by)

        return qs


class MaterialDetailView(generics.RetrieveAPIView):
    """Public detail view for a single material."""
    queryset = Material.objects.filter(is_approved=True, is_published=True)
    serializer_class = MaterialDetailSerializer
    permission_classes = [permissions.AllowAny]


# ────────────────────────────────────────
# AUTHOR CONTENT MANAGEMENT (Phase 2)
# ────────────────────────────────────────

class AuthorMaterialListView(generics.ListCreateAPIView):
    """List author's own materials or create new ones."""
    permission_classes = [IsVerifiedAuthor]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MaterialCreateSerializer
        return MaterialListSerializer

    def get_queryset(self):
        return Material.objects.filter(author=self.request.user.profile)

    def perform_create(self, serializer):
        # Verified authors are auto-approved on publish.
        serializer.save(author=self.request.user.profile, is_approved=True)


class AuthorMaterialDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Author can view/update/delete their own materials."""
    serializer_class = MaterialCreateSerializer
    permission_classes = [IsVerifiedAuthor, IsOwnerOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return Material.objects.filter(author=self.request.user.profile)


# ────────────────────────────────────────
# SECURE CONTENT ACCESS (Phase 4)
# ────────────────────────────────────────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_signed_url(request, pk):
    """
    Generate a time-limited signed URL for purchased content.
    Verifies enrollment before granting access.
    """
    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    has_access = _user_has_material_access(request.user, material)

    if not has_access:
        return Response({'error': 'You have not purchased this material'}, status=status.HTTP_403_FORBIDDEN)

    if material.type == 'MCQ':
        return Response({'type': material.type, 'title': material.title})

    if not material.file_path:
        return Response({'error': 'No file associated with this material'}, status=status.HTTP_404_NOT_FOUND)

    signed_url = generate_signed_url(material.file_path)
    if not signed_url:
        return Response({'error': 'Could not generate access URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'url': signed_url, 'type': material.type, 'title': material.title})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_secure_pdf_meta(request, pk):
    """Return page count and title for secure PDF viewer."""
    if fitz is None:
        return Response({'error': 'PDF renderer is not available on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    if material.type != 'PDF':
        return Response({'error': 'Material is not a PDF.'}, status=status.HTTP_400_BAD_REQUEST)

    if not _user_has_material_access(request.user, material):
        return Response({'error': 'You have not purchased this material'}, status=status.HTTP_403_FORBIDDEN)

    signed_url = generate_signed_url(material.file_path)
    if not signed_url:
        return Response({'error': 'Could not generate file access URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        resp = requests.get(signed_url, timeout=30)
        resp.raise_for_status()
        with fitz.open(stream=resp.content, filetype='pdf') as doc:
            pages = doc.page_count
    except Exception:
        return Response({'error': 'Failed to load PDF file.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({'title': material.title, 'pages': pages})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_secure_pdf_page(request, pk, page_num):
    """Render one PDF page as watermarked PNG image."""
    if fitz is None:
        return Response({'error': 'PDF renderer is not available on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    if material.type != 'PDF':
        return Response({'error': 'Material is not a PDF.'}, status=status.HTTP_400_BAD_REQUEST)

    if not _user_has_material_access(request.user, material):
        return Response({'error': 'You have not purchased this material'}, status=status.HTTP_403_FORBIDDEN)

    signed_url = generate_signed_url(material.file_path)
    if not signed_url:
        return Response({'error': 'Could not generate file access URL'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    try:
        resp = requests.get(signed_url, timeout=30)
        resp.raise_for_status()
        with fitz.open(stream=resp.content, filetype='pdf') as doc:
            if page_num < 1 or page_num > doc.page_count:
                return Response({'error': 'Invalid page number.'}, status=status.HTTP_400_BAD_REQUEST)

            page = doc.load_page(page_num - 1)
            stamp = f"{request.user.profile.email or request.user.profile.full_name or request.user.id} | {datetime.utcnow().isoformat()} UTC"
            width = float(page.rect.width)
            height = float(page.rect.height)
            for y in range(80, int(height), 200):
                for x in range(20, int(width), 280):
                    page.insert_text(
                        (x, y),
                        stamp,
                        fontsize=10,
                        color=(0.8, 0.0, 0.0),
                        fill_opacity=0.22,
                    )

            pix = page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), alpha=False)
            return HttpResponse(pix.tobytes('png'), content_type='image/png')
    except Exception:
        return Response({'error': 'Failed to render PDF page.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ────────────────────────────────────────
# REVIEWS
# ────────────────────────────────────────

class MaterialReviewCreateView(generics.CreateAPIView):
    """Students can review purchased materials. Updates existing review if re-rating."""
    serializer_class = MaterialReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            material = Material.objects.get(pk=self.kwargs['pk'])
        except Material.DoesNotExist:
            return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)
            
        review = MaterialReview.objects.filter(user=request.user.profile, material=material).first()
        
        if review:
            serializer = self.get_serializer(review, data=request.data, partial=True)
            status_code = status.HTTP_200_OK
        else:
            serializer = self.get_serializer(data=request.data)
            status_code = status.HTTP_201_CREATED
            
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user.profile, material=material)
        
        # Update average rating
        avg = MaterialReview.objects.filter(material=material).aggregate(avg=Avg('rating'))['avg']
        material.average_rating = avg or 0
        material.save(update_fields=['average_rating'])
        
        return Response(serializer.data, status=status_code)


# ────────────────────────────────────────
# ADMIN MODERATION (Phase 6)
# ────────────────────────────────────────

class AdminMaterialListView(generics.ListAPIView):
    """Admin view to list materials pending approval."""
    serializer_class = MaterialAdminSerializer
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Material.objects.all()
        approved = self.request.query_params.get('approved')
        if approved is not None:
            qs = qs.filter(is_approved=approved.lower() in ('true', '1'))
        return qs


@api_view(['POST'])
@permission_classes([IsAdmin])
def moderate_material(request, pk):
    """Admin endpoint to approve or reject a material."""
    try:
        material = Material.objects.get(pk=pk)
    except Material.DoesNotExist:
        return Response({'error': 'Material not found'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')
    if action == 'approve':
        material.is_approved = True
        material.save()
        return Response({'status': 'Material approved'})
    elif action == 'reject':
        material.is_approved = False
        material.is_published = False
        material.save()
        return Response({'status': 'Material rejected'})
    return Response({'error': 'Invalid action'}, status=status.HTTP_400_BAD_REQUEST)
