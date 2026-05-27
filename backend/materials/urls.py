"""
URL patterns for materials app.
"""
from django.urls import path
from . import views

app_name = 'materials'

urlpatterns = [
    # Public marketplace
    path('', views.MarketplaceListView.as_view(), name='marketplace-list'),
    path('<uuid:pk>/', views.MaterialDetailView.as_view(), name='material-detail'),
    path('<uuid:pk>/access/', views.get_signed_url, name='material-access'),
    path('<uuid:pk>/pdf/meta/', views.get_secure_pdf_meta, name='secure-pdf-meta'),
    path('<uuid:pk>/pdf/page/<int:page_num>/', views.get_secure_pdf_page, name='secure-pdf-page'),
    path('<uuid:pk>/reviews/', views.MaterialReviewCreateView.as_view(), name='material-review'),

    # Author management
    path('my/', views.AuthorMaterialListView.as_view(), name='author-materials'),
    path('my/<uuid:pk>/', views.AuthorMaterialDetailView.as_view(), name='author-material-detail'),

    # Admin moderation
    path('admin/list/', views.AdminMaterialListView.as_view(), name='admin-materials'),
    path('admin/<uuid:pk>/moderate/', views.moderate_material, name='admin-moderate'),
]
