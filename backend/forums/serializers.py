"""
Serializers for forums.
"""
from rest_framework import serializers
from .models import ForumPost, PostLike
from accounts.serializers import ProfilePublicSerializer


class ForumReplySerializer(serializers.ModelSerializer):
    """Serializer for reply posts."""
    user = ProfilePublicSerializer(read_only=True)

    class Meta:
        model = ForumPost
        fields = ['id', 'user', 'content', 'likes_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'likes_count', 'created_at', 'updated_at']


class ForumPostSerializer(serializers.ModelSerializer):
    """Full forum post serializer with replies."""
    user = ProfilePublicSerializer(read_only=True)
    replies = ForumReplySerializer(many=True, read_only=True)
    reply_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ForumPost
        fields = [
            'id', 'user', 'material', 'title', 'content', 'post_type', 'topic',
            'parent', 'is_pinned', 'likes_count', 'reply_count',
            'replies', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'user', 'is_pinned', 'likes_count', 'created_at', 'updated_at']


class ForumPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing forum posts."""
    user = ProfilePublicSerializer(read_only=True)
    reply_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ForumPost
        fields = [
            'id', 'user', 'material', 'title', 'content', 'post_type', 'topic',
            'is_pinned', 'likes_count', 'reply_count', 'created_at',
        ]


class ForumPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating forum posts/replies."""
    class Meta:
        model = ForumPost
        fields = ['title', 'content', 'material', 'parent', 'post_type', 'topic']
