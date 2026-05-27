"""
Serializers for materials.
"""
import json
import os
import uuid
from django.db.models import Avg, Sum
from rest_framework import serializers
from .models import Material, MaterialReview
from .storage import upload_to_supabase, generate_signed_url
from accounts.serializers import ProfilePublicSerializer

try:
    import fitz
except Exception:  # pragma: no cover
    fitz = None


def format_file_size(size_bytes):
    if not size_bytes:
        return ''
    if size_bytes < 1024:
        return f'{size_bytes} B'
    if size_bytes < 1024 * 1024:
        return f'{size_bytes / 1024:.1f} KB'
    return f'{size_bytes / (1024 * 1024):.1f} MB'


class MaterialReviewSerializer(serializers.ModelSerializer):
    user = ProfilePublicSerializer(read_only=True)

    class Meta:
        model = MaterialReview
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class MaterialListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for marketplace listing grid."""
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    review_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'type', 'price', 'thumbnail_url',
            'university', 'category', 'course', 'semester', 'tags',
            'author_name', 'average_rating', 'review_count',
            'total_sales', 'created_at',
        ]

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail_url:
            return ''
        if obj.thumbnail_url.startswith('http://') or obj.thumbnail_url.startswith('https://'):
            return obj.thumbnail_url
        return generate_signed_url(obj.thumbnail_url, bucket='private-materials', expires_in=3600) or ''


class MaterialDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer including author info and reviews."""
    author = ProfilePublicSerializer(read_only=True)
    reviews = MaterialReviewSerializer(many=True, read_only=True)
    review_count = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    file_size_display = serializers.SerializerMethodField()
    author_stats = serializers.SerializerMethodField()

    class Meta:
        model = Material
        fields = [
            'id', 'author', 'author_stats', 'title', 'description', 'about_material', 'type',
            'price', 'thumbnail_url', 'university', 'category', 'course',
            'semester', 'tags', 'page_count', 'topics_covered', 'level', 'language',
            'file_size_bytes', 'file_size_display', 'is_approved', 'is_published',
            'average_rating', 'review_count', 'total_sales',
            'reviews', 'created_at', 'updated_at',
        ]

    def get_review_count(self, obj):
        return obj.reviews.count()

    def get_thumbnail_url(self, obj):
        if not obj.thumbnail_url:
            return ''
        if obj.thumbnail_url.startswith('http://') or obj.thumbnail_url.startswith('https://'):
            return obj.thumbnail_url
        return generate_signed_url(obj.thumbnail_url, bucket='private-materials', expires_in=3600) or ''

    def get_file_size_display(self, obj):
        return format_file_size(obj.file_size_bytes)

    def get_author_stats(self, obj):
        from materials.models import MaterialReview
        author_materials = Material.objects.filter(
            author=obj.author,
            is_approved=True,
            is_published=True,
        )
        material_count = author_materials.count()
        total_students = author_materials.aggregate(total=Sum('total_sales'))['total'] or 0
        # Calculate weighted average rating based on actual review counts
        avg_rating = MaterialReview.objects.filter(material__author=obj.author).aggregate(avg=Avg('rating'))['avg'] or 0
        return {
            'material_count': material_count,
            'total_students': total_students,
            'avg_rating': round(float(avg_rating), 1),
        }


class MaterialCreateSerializer(serializers.ModelSerializer):
    """Serializer for authors creating/updating materials."""
    material_file = serializers.FileField(write_only=True, required=False, allow_null=True)
    thumbnail_file = serializers.ImageField(write_only=True, required=False, allow_null=True)
    tags = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = Material
        fields = [
            'id', 'title', 'description', 'about_material', 'type', 'price',
            'file_path', 'thumbnail_url', 'university', 'category',
            'course', 'semester', 'tags', 'page_count', 'topics_covered',
            'level', 'language', 'material_file', 'thumbnail_file',
        ]
        extra_kwargs = {
            'file_path': {'required': False, 'allow_blank': True},
            'thumbnail_url': {'required': False, 'allow_blank': True},
        }

    def validate_category(self, value):
        if value and value not in dict(Material.Category.choices):
            raise serializers.ValidationError('Invalid category selected.')
        return value

    def validate_level(self, value):
        if value and value not in dict(Material.DifficultyLevel.choices):
            raise serializers.ValidationError('Invalid difficulty level selected.')
        return value

    def validate_tags(self, value):
        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return []
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, list):
                    return [str(t).strip() for t in parsed if str(t).strip()]
            except json.JSONDecodeError:
                pass
            return [t.strip() for t in raw.split(',') if t.strip()]
        if value is None:
            return []
        return value

    def validate(self, attrs):
        material_type = attrs.get('type') or getattr(self.instance, 'type', None)
        material_file = attrs.get('material_file')
        category = attrs.get('category')
        if self.instance is None and not category:
            raise serializers.ValidationError({'category': 'Please select a category.'})

        if material_type in ('PDF', 'VIDEO') and not material_file and not getattr(self.instance, 'file_path', ''):
            raise serializers.ValidationError({'material_file': 'Please upload a file for PDF/VIDEO materials.'})

        if material_file:
            name = (material_file.name or '').lower()
            content_type = (getattr(material_file, 'content_type', '') or '').lower()
            if material_type == 'PDF':
                if not (name.endswith('.pdf') or content_type == 'application/pdf'):
                    raise serializers.ValidationError({'material_file': 'Please upload a valid PDF file.'})
            if material_type == 'VIDEO':
                if not (content_type.startswith('video/') or name.endswith(('.mp4', '.mov', '.avi', '.mkv', '.webm'))):
                    raise serializers.ValidationError({'material_file': 'Please upload a valid video file.'})

        return attrs

    def _extract_file_metadata(self, material, material_file):
        material.file_size_bytes = getattr(material_file, 'size', None) or 0
        if material.type == 'PDF' and fitz is not None:
            try:
                if hasattr(material_file, 'seek'):
                    material_file.seek(0)
                data = material_file.read()
                if hasattr(material_file, 'seek'):
                    material_file.seek(0)
                with fitz.open(stream=data, filetype='pdf') as doc:
                    material.page_count = doc.page_count
            except Exception:
                pass

    def _upload_files(self, material, material_file=None, thumbnail_file=None):
        if material_file:
            self._extract_file_metadata(material, material_file)
            file_ext = os.path.splitext(material_file.name or '')[1] or ''
            safe_ext = file_ext.lower()[:10]
            content_folder = 'pdfs' if material.type == 'PDF' else 'videos'
            storage_path = f'authors/{material.author.id}/{content_folder}/{uuid.uuid4().hex}{safe_ext}'
            uploaded_path = upload_to_supabase(
                material_file,
                storage_path,
                bucket='private-materials',
                content_type=getattr(material_file, 'content_type', 'application/octet-stream') or 'application/octet-stream',
            )
            if not uploaded_path:
                raise serializers.ValidationError({'material_file': 'Failed to upload material file to storage.'})
            material.file_path = uploaded_path

        if thumbnail_file:
            thumb_ext = os.path.splitext(thumbnail_file.name or '')[1] or '.jpg'
            storage_path = f'authors/{material.author.id}/thumbnails/{uuid.uuid4().hex}{thumb_ext.lower()[:10]}'
            uploaded_path = upload_to_supabase(
                thumbnail_file,
                storage_path,
                bucket='private-materials',
                content_type=getattr(thumbnail_file, 'content_type', 'image/jpeg') or 'image/jpeg',
            )
            if not uploaded_path:
                raise serializers.ValidationError({'thumbnail_file': 'Failed to upload thumbnail image to storage.'})
            material.thumbnail_url = f'{uploaded_path}'

    def create(self, validated_data):
        material_file = validated_data.pop('material_file', None)
        thumbnail_file = validated_data.pop('thumbnail_file', None)

        material = Material.objects.create(**validated_data)
        self._upload_files(material, material_file=material_file, thumbnail_file=thumbnail_file)
        material.save()
        return material

    def update(self, instance, validated_data):
        material_file = validated_data.pop('material_file', None)
        thumbnail_file = validated_data.pop('thumbnail_file', None)

        for key, value in validated_data.items():
            setattr(instance, key, value)
        self._upload_files(instance, material_file=material_file, thumbnail_file=thumbnail_file)
        instance.save()
        return instance


class MaterialAdminSerializer(serializers.ModelSerializer):
    """Admin serializer for content moderation."""
    author = ProfilePublicSerializer(read_only=True)

    class Meta:
        model = Material
        fields = [
            'id', 'author', 'title', 'description', 'about_material', 'type',
            'price', 'file_path', 'thumbnail_url', 'university', 'category',
            'course', 'semester', 'tags', 'page_count', 'topics_covered',
            'level', 'language', 'file_size_bytes', 'is_approved',
            'is_published', 'created_at',
        ]
        read_only_fields = ['id', 'author', 'created_at']
