"""
URL patterns for forums app.
"""
from django.urls import path
from . import views

app_name = 'forums'

urlpatterns = [
    path('stats/', views.forum_stats, name='forum-stats'),
    path('', views.ForumPostListView.as_view(), name='post-list'),
    path('<uuid:pk>/', views.ForumPostDetailView.as_view(), name='post-detail'),
    path('<uuid:pk>/like/', views.toggle_like, name='post-like'),
]
