"""
URL patterns for accounts app.
"""
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('me/', views.ProfileMeView.as_view(), name='profile-me'),
    path('setup/', views.ProfileSetupView.as_view(), name='profile-setup'),
    path('profile/<uuid:pk>/', views.ProfileDetailView.as_view(), name='profile-detail'),
    path('authors/', views.AuthorListView.as_view(), name='author-list'),
    path('authors/<uuid:pk>/verify/', views.verify_author, name='author-verify'),
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<uuid:pk>/', views.delete_user_profile, name='admin-user-delete'),
]
