"""
URL patterns for commerce app.
"""
from django.urls import path
from . import views

app_name = 'commerce'

urlpatterns = [
    # Library & history
    path('library/', views.MyLibraryView.as_view(), name='my-library'),
    path('transactions/', views.TransactionHistoryView.as_view(), name='transactions'),

    # Enrollment check
    path('check/<uuid:material_id>/', views.check_enrollment, name='check-enrollment'),

    # Free material purchase
    path('purchase/', views.PurchaseMaterialView.as_view(), name='purchase'),

    # Razorpay — paid checkout
    path('create-order/', views.create_razorpay_order, name='create-order'),
    path('verify-payment/', views.verify_razorpay_payment, name='verify-payment'),
]
