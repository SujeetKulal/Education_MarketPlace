"""
URL patterns for assessments app.
"""
from django.urls import path
from . import views

app_name = 'assessments'

urlpatterns = [
    path('create/', views.MCQCreateView.as_view(), name='mcq-create'),
    path('<uuid:pk>/', views.MCQDetailView.as_view(), name='mcq-detail'),
    path('<uuid:pk>/take/', views.MCQStudentView.as_view(), name='mcq-take'),
    path('<uuid:pk>/submit/', views.submit_mcq, name='mcq-submit'),
    # Student routes by material ID (frontend uses material UUID)
    path('material/<uuid:material_id>/take/', views.MCQStudentByMaterialView.as_view(), name='mcq-take-by-material'),
    path('material/<uuid:material_id>/submit/', views.submit_mcq_by_material, name='mcq-submit-by-material'),
    path('my-attempts/', views.MyAttemptsView.as_view(), name='my-attempts'),
]
