"""
URL patterns for analytics app.
"""
from django.urls import path
from . import views

app_name = 'analytics'

urlpatterns = [
    # Admin analytics
    path('admin/overview/', views.admin_overview, name='admin-overview'),
    path('admin/revenue/', views.revenue_chart, name='revenue-chart'),
    path('admin/users/', views.user_growth_chart, name='user-growth'),
    path('admin/health/', views.platform_health, name='platform-health'),

    # Author analytics
    path('author/', views.author_analytics, name='author-analytics'),
]
