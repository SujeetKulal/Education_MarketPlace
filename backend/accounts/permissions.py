"""
Custom permission classes for role-based access control.
"""
from rest_framework import permissions


class IsAdmin(permissions.BasePermission):
    """Only allow admin users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile
            and request.user.profile.role == 'ADMIN'
        )


class IsAuthor(permissions.BasePermission):
    """Only allow author users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile
            and request.user.profile.role == 'AUTHOR'
        )


class IsVerifiedAuthor(permissions.BasePermission):
    """Only allow verified author users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile
            and request.user.profile.role == 'AUTHOR'
            and request.user.profile.is_verified
        )


class IsStudent(permissions.BasePermission):
    """Only allow student users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and hasattr(request.user, 'profile')
            and request.user.profile
            and request.user.profile.role == 'STUDENT'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow object owner or admin."""
    def has_object_permission(self, request, view, obj):
        if hasattr(request.user, 'profile') and request.user.profile.role == 'ADMIN':
            return True
        # Check various ownership fields
        if hasattr(obj, 'supabase_id'):
            return obj.supabase_id == request.user.id
        if hasattr(obj, 'author') and hasattr(obj.author, 'supabase_id'):
            return obj.author.supabase_id == request.user.id
        if hasattr(obj, 'user') and hasattr(obj.user, 'supabase_id'):
            return obj.user.supabase_id == request.user.id
        return False


class ReadOnly(permissions.BasePermission):
    """Allow read-only access."""
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS
