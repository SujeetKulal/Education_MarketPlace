"""
URL configuration for Education Marketplace.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/materials/', include('materials.urls')),
    path('api/commerce/', include('commerce.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/forums/', include('forums.urls')),
    path('api/analytics/', include('analytics.urls')),
]
