"""
Serializers for user profile management.
"""
from rest_framework import serializers
from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):
    """Full profile serializer for the owner and admins."""
    class Meta:
        model = Profile
        fields = [
            'id', 'supabase_id', 'email', 'full_name', 'role',
            'university', 'bio', 'avatar_url', 'is_verified',
            'verification_docs_url', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'supabase_id', 'is_verified', 'created_at', 'updated_at']


class ProfilePublicSerializer(serializers.ModelSerializer):
    """Public profile serializer — limited fields for other users."""
    class Meta:
        model = Profile
        fields = ['id', 'full_name', 'role', 'university', 'avatar_url', 'bio', 'is_verified']
        read_only_fields = fields


class AuthorVerificationSerializer(serializers.ModelSerializer):
    """Serializer for author verification requests."""
    class Meta:
        model = Profile
        fields = [
            'id', 'full_name', 'email', 'university', 'avatar_url',
            'verification_docs_url', 'is_verified', 'created_at',
        ]
        read_only_fields = [
            'id', 'full_name', 'email', 'university', 'avatar_url',
            'verification_docs_url', 'created_at',
        ]


class AdminProfileSerializer(serializers.ModelSerializer):
    """Admin-facing serializer for user management."""
    class Meta:
        model = Profile
        fields = [
            'id', 'supabase_id', 'email', 'full_name', 'role',
            'university', 'avatar_url', 'is_verified', 'created_at',
        ]
        read_only_fields = fields


class RegisterSerializer(serializers.Serializer):
    """Serializer for the registration/profile-setup endpoint."""
    full_name = serializers.CharField(max_length=255)
    role = serializers.ChoiceField(choices=[('STUDENT', 'Student'), ('AUTHOR', 'Author')])
    university = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    verification_docs_url = serializers.URLField(required=False, allow_blank=True)
