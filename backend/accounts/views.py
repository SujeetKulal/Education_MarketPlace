"""
Views for authentication and profile management.
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Profile
from .authentication import SupabaseAuthentication
from .serializers import (
    ProfileSerializer, ProfilePublicSerializer,
    AuthorVerificationSerializer, AdminProfileSerializer, RegisterSerializer,
)
from .permissions import IsAdmin, IsOwnerOrAdmin


class ProfileMeView(generics.RetrieveUpdateAPIView):
    """Get or update the current user's profile."""
    serializer_class = ProfileSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


class ProfileSetupView(generics.CreateAPIView):
    """
    Complete profile setup after Supabase Auth registration.
    Updates the auto-created profile with role, name, university, etc.
    """
    serializer_class = RegisterSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = request.user.profile
        profile.full_name = serializer.validated_data['full_name']
        profile.role = serializer.validated_data['role']
        profile.university = serializer.validated_data.get('university', '')
        profile.bio = serializer.validated_data.get('bio', '')
        profile.verification_docs_url = serializer.validated_data.get('verification_docs_url', '')
        profile.save()

        return Response(ProfileSerializer(profile).data, status=status.HTTP_200_OK)


class ProfileDetailView(generics.RetrieveAPIView):
    """View another user's public profile."""
    queryset = Profile.objects.all()
    serializer_class = ProfilePublicSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [permissions.IsAuthenticated]


class AuthorListView(generics.ListAPIView):
    """List all authors (for admin verification queue)."""
    serializer_class = AuthorVerificationSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Profile.objects.filter(role=Profile.Role.AUTHOR)
        verified = self.request.query_params.get('verified')
        search = self.request.query_params.get('search')
        if verified is not None:
            qs = qs.filter(is_verified=verified.lower() in ('true', '1'))
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(full_name__icontains=search)
                | Q(university__icontains=search)
            )
        return qs.order_by('-created_at')


class AdminUserListView(generics.ListAPIView):
    """Admin list of users (students/authors/admins) with optional filters."""
    serializer_class = AdminProfileSerializer
    authentication_classes = [SupabaseAuthentication]
    permission_classes = [IsAdmin]

    def get_queryset(self):
        qs = Profile.objects.all()
        role = self.request.query_params.get('role')
        verified = self.request.query_params.get('verified')
        search = self.request.query_params.get('search')

        if role:
            qs = qs.filter(role=role.upper())
        if verified is not None:
            qs = qs.filter(is_verified=verified.lower() in ('true', '1'))
        if search:
            qs = qs.filter(
                Q(email__icontains=search)
                | Q(full_name__icontains=search)
                | Q(role__icontains=search)
                | Q(university__icontains=search)
            )

        account_status = self.request.query_params.get('status', '').lower()
        if account_status == 'pending':
            qs = qs.filter(role=Profile.Role.AUTHOR, is_verified=False)
        elif account_status == 'verified':
            qs = qs.filter(role=Profile.Role.AUTHOR, is_verified=True)
        elif account_status == 'active':
            qs = qs.exclude(role=Profile.Role.AUTHOR, is_verified=False)

        return qs.order_by('-created_at')


@api_view(['POST'])
@permission_classes([IsAdmin])
def verify_author(request, pk):
    """Admin endpoint to verify/reject an author."""
    try:
        profile = Profile.objects.get(pk=pk, role=Profile.Role.AUTHOR)
    except Profile.DoesNotExist:
        return Response({'error': 'Author not found'}, status=status.HTTP_404_NOT_FOUND)

    action = request.data.get('action')  # 'approve' or 'reject'
    if action == 'approve':
        profile.is_verified = True
        profile.save()
        return Response({'status': 'Author verified successfully'})
    elif action in ('reject', 'unverify'):
        profile.is_verified = False
        profile.save()
        return Response({'status': 'Author marked as unverified'})
    else:
        return Response({'error': 'Invalid action. Use "approve", "reject", or "unverify".'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_user_profile(request, pk):
    """Admin endpoint to delete a user's platform profile."""
    try:
        profile = Profile.objects.get(pk=pk)
    except Profile.DoesNotExist:
        return Response({'error': 'User profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if profile.supabase_id == request.user.id:
        return Response({'error': 'You cannot delete your own admin profile.'}, status=status.HTTP_400_BAD_REQUEST)

    profile.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
