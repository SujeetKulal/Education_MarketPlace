"""
Views for community forums.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q

from accounts.models import Profile
from .models import ForumPost, PostLike
from .serializers import (
    ForumPostSerializer, ForumPostListSerializer,
    ForumPostCreateSerializer,
)
from accounts.permissions import IsOwnerOrAdmin


class ForumPostListView(generics.ListCreateAPIView):
    """List all top-level forum posts or create a new one."""

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ForumPostCreateSerializer
        return ForumPostListSerializer

    def get_queryset(self):
        qs = ForumPost.objects.filter(parent__isnull=True).annotate(
            reply_count=Count('replies')
        )

        material_id = self.request.query_params.get('material')
        if material_id:
            qs = qs.filter(material_id=material_id)

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(title__icontains=search)

        post_type = self.request.query_params.get('post_type')
        if post_type:
            qs = qs.filter(post_type=post_type.upper())

        topic = self.request.query_params.get('topic')
        if topic:
            qs = qs.filter(topic=topic)

        mine = self.request.query_params.get('mine')
        if mine and mine.lower() in ('true', '1') and self.request.user.is_authenticated:
            qs = qs.filter(user=self.request.user.profile)

        unanswered = self.request.query_params.get('unanswered')
        if unanswered and unanswered.lower() in ('true', '1'):
            qs = qs.filter(reply_count=0)

        following = self.request.query_params.get('following')
        if following and following.lower() in ('true', '1') and self.request.user.is_authenticated:
            profile = self.request.user.profile
            qs = qs.filter(
                Q(user=profile)
                | Q(likes__user=profile)
                | Q(replies__user=profile)
            ).distinct()

        sort = self.request.query_params.get('sort', 'latest')
        if sort == 'oldest':
            return qs.order_by('-is_pinned', 'created_at')
        if sort == 'liked':
            return qs.order_by('-is_pinned', '-likes_count', '-created_at')

        return qs.order_by('-is_pinned', '-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user.profile)


class ForumPostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View, update, or delete a forum post."""
    serializer_class = ForumPostSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        return ForumPost.objects.annotate(reply_count=Count('replies'))


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def forum_stats(request):
    """Aggregate stats for the community forum header."""
    top_level = ForumPost.objects.filter(parent__isnull=True)
    active_members = (
        Profile.objects.filter(forum_posts__parent__isnull=True).distinct().count()
    )
    top_contributors = (
        Profile.objects.annotate(
            post_count=Count('forum_posts', filter=Q(forum_posts__parent__isnull=True)),
        )
        .filter(post_count__gt=0)
        .count()
    )
    return Response({
        'total_posts': top_level.count(),
        'active_members': active_members,
        'top_contributors': top_contributors,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_like(request, pk):
    """Toggle like on a forum post."""
    try:
        post = ForumPost.objects.get(pk=pk)
    except ForumPost.DoesNotExist:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    like, created = PostLike.objects.get_or_create(
        user=request.user.profile,
        post=post,
    )

    if not created:
        like.delete()
        post.likes_count = max(0, post.likes_count - 1)
        post.save(update_fields=['likes_count'])
        return Response({'liked': False, 'likes_count': post.likes_count})

    post.likes_count += 1
    post.save(update_fields=['likes_count'])
    return Response({'liked': True, 'likes_count': post.likes_count})
