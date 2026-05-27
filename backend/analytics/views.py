"""
Views for platform analytics — admin dashboard data.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, Count, Avg
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta

from accounts.models import Profile
from accounts.permissions import IsAdmin, IsAuthor
from materials.models import Material, MaterialReview
from commerce.models import Enrollment, Transaction
from assessments.models import MCQAttempt
from forums.models import ForumPost


def _daily_series(qs, date_field, value_field=None, days=7):
    """Build a list of daily counts or sums for the last N days."""
    now = timezone.now()
    start = now - timedelta(days=days - 1)
    if value_field:
        daily_qs = (
            qs.filter(**{f'{date_field}__gte': start.replace(hour=0, minute=0, second=0, microsecond=0)})
            .annotate(day=TruncDate(date_field))
            .values('day')
            .annotate(total=Sum(value_field))
            .order_by('day')
        )
        daily_map = {item['day']: float(item['total'] or 0) for item in daily_qs}
    else:
        daily_qs = (
            qs.filter(**{f'{date_field}__gte': start.replace(hour=0, minute=0, second=0, microsecond=0)})
            .annotate(day=TruncDate(date_field))
            .values('day')
            .annotate(total=Count('id'))
            .order_by('day')
        )
        daily_map = {item['day']: item['total'] for item in daily_qs}

    series = []
    for offset in range(days):
        day = (now - timedelta(days=days - 1 - offset)).date()
        series.append(daily_map.get(day, 0))
    return series


def _daily_avg_series(qs, date_field, avg_field, days=7):
    """Build a list of daily averages for the last N days."""
    now = timezone.now()
    start = now - timedelta(days=days - 1)
    daily_qs = (
        qs.filter(**{f'{date_field}__gte': start.replace(hour=0, minute=0, second=0, microsecond=0)})
        .annotate(day=TruncDate(date_field))
        .values('day')
        .annotate(avg=Avg(avg_field))
        .order_by('day')
    )
    daily_map = {item['day']: round(float(item['avg'] or 0), 2) for item in daily_qs}
    series = []
    for offset in range(days):
        day = (now - timedelta(days=days - 1 - offset)).date()
        series.append(daily_map.get(day, 0))
    return series


def _recent_activities(limit=5):
    """Latest platform events for the admin activity feed."""
    activities = []

    for profile in Profile.objects.order_by('-created_at')[:limit]:
        activities.append({
            'type': 'user_registered',
            'title': 'New user registered',
            'detail': profile.full_name or profile.email or 'User',
            'timestamp': profile.created_at.isoformat(),
        })

    for material in (
        Material.objects.filter(is_approved=True)
        .select_related('author')
        .order_by('-created_at')[:limit]
    ):
        activities.append({
            'type': 'material_published',
            'title': f"Material '{material.title}' published",
            'detail': material.author.full_name if material.author else 'Author',
            'timestamp': material.created_at.isoformat(),
        })

    for enrollment in (
        Enrollment.objects.filter(status='ACTIVE')
        .select_related('user', 'material')
        .order_by('-purchase_date')[:limit]
    ):
        activities.append({
            'type': 'enrollment',
            'title': f"New enrollment in '{enrollment.material.title}'",
            'detail': enrollment.user.full_name if enrollment.user else 'Student',
            'timestamp': enrollment.purchase_date.isoformat(),
        })

    for txn in (
        Transaction.objects.filter(status='COMPLETED')
        .select_related('user')
        .order_by('-created_at')[:limit]
    ):
        activities.append({
            'type': 'payment',
            'title': 'Payment received',
            'detail': f"₹{float(txn.amount):,.2f} from {txn.user.full_name if txn.user else 'User'}",
            'timestamp': txn.created_at.isoformat(),
        })

    activities.sort(key=lambda item: item['timestamp'], reverse=True)
    return activities[:limit]


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_overview(request):
    """
    Global admin analytics overview.
    Returns platform-wide metrics.
    """
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    total_users = Profile.objects.count()
    total_students = Profile.objects.filter(role=Profile.Role.STUDENT).count()
    total_authors = Profile.objects.filter(role=Profile.Role.AUTHOR).count()
    verified_authors = Profile.objects.filter(role=Profile.Role.AUTHOR, is_verified=True).count()
    pending_authors = Profile.objects.filter(role=Profile.Role.AUTHOR, is_verified=False).count()

    total_materials = Material.objects.count()
    approved_materials = Material.objects.filter(is_approved=True).count()
    pending_materials = Material.objects.filter(is_approved=False).count()

    total_revenue = Transaction.objects.filter(
        status='COMPLETED'
    ).aggregate(total=Sum('amount'))['total'] or 0

    total_enrollments = Enrollment.objects.filter(status='ACTIVE').count()
    total_forum_posts = ForumPost.objects.count()

    recent_enrollments = Enrollment.objects.filter(purchase_date__gte=thirty_days_ago).count()
    prev_enrollments = Enrollment.objects.filter(
        purchase_date__gte=sixty_days_ago,
        purchase_date__lt=thirty_days_ago,
    ).count()

    recent_revenue = Transaction.objects.filter(
        status='COMPLETED',
        created_at__gte=thirty_days_ago,
    ).aggregate(total=Sum('amount'))['total'] or 0
    prev_revenue = Transaction.objects.filter(
        status='COMPLETED',
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago,
    ).aggregate(total=Sum('amount'))['total'] or 0

    new_users = Profile.objects.filter(created_at__gte=thirty_days_ago).count()
    prev_new_users = Profile.objects.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago,
    ).count()

    materials_30 = Material.objects.filter(created_at__gte=thirty_days_ago).count()
    materials_prev_30 = Material.objects.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago,
    ).count()

    category_rows = (
        Transaction.objects.filter(status='COMPLETED')
        .values('material__category')
        .annotate(revenue=Sum('amount'))
        .order_by('-revenue')
    )
    category_total = sum(float(row['revenue'] or 0) for row in category_rows) or 1
    categories = []
    for row in category_rows[:6]:
        name = row['material__category'] or 'Other'
        revenue = float(row['revenue'] or 0)
        if revenue <= 0:
            continue
        categories.append({
            'name': name,
            'revenue': revenue,
            'pct': round((revenue / category_total) * 100),
        })

    return Response({
        'users': {
            'total': total_users,
            'students': total_students,
            'authors': total_authors,
            'verified_authors': verified_authors,
            'pending_authors': pending_authors,
            'new_last_30_days': new_users,
            'change_pct': _pct_change(new_users, prev_new_users),
        },
        'materials': {
            'total': total_materials,
            'approved': approved_materials,
            'pending': pending_materials,
            'change_pct': _pct_change(materials_30, materials_prev_30),
        },
        'revenue': {
            'total': float(total_revenue),
            'last_30_days': float(recent_revenue),
            'change_pct': _pct_change(recent_revenue, prev_revenue),
        },
        'engagement': {
            'total_enrollments': total_enrollments,
            'recent_enrollments': recent_enrollments,
            'total_forum_posts': total_forum_posts,
            'change_pct': _pct_change(recent_enrollments, prev_enrollments),
        },
        'categories': categories,
        'recent_activities': _recent_activities(),
        'sparklines': {
            'users': _daily_series(Profile.objects.all(), 'created_at'),
            'materials': _daily_series(Material.objects.all(), 'created_at'),
            'revenue': _daily_series(
                Transaction.objects.filter(status='COMPLETED'),
                'created_at',
                value_field='amount',
            ),
            'enrollments': _daily_series(
                Enrollment.objects.filter(status='ACTIVE'),
                'purchase_date',
            ),
        },
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def revenue_chart(request):
    """
    Revenue data for charting — daily (last N days) or monthly.
    """
    granularity = request.query_params.get('granularity', 'month')
    if granularity == 'day':
        try:
            days = int(request.query_params.get('days', '30'))
        except ValueError:
            days = 30
        days = max(7, min(days, 90))
        now = timezone.now()
        start = now - timedelta(days=days - 1)

        daily_qs = (
            Transaction.objects
            .filter(status='COMPLETED', created_at__gte=start.replace(hour=0, minute=0, second=0, microsecond=0))
            .annotate(day=TruncDate('created_at'))
            .values('day')
            .annotate(total=Sum('amount'), count=Count('id'))
            .order_by('day')
        )
        daily_map = {item['day']: item for item in daily_qs}
        data = []
        for offset in range(days):
            day = (now - timedelta(days=days - 1 - offset)).date()
            row = daily_map.get(day)
            data.append({
                'date': day.strftime('%b %d'),
                'full_date': day.isoformat(),
                'revenue': float(row['total'] or 0) if row else 0.0,
                'transactions': row['count'] if row else 0,
            })
        return Response({'data': data, 'granularity': 'day'})

    period = request.query_params.get('period', '12')  # months
    try:
        months = int(period)
    except ValueError:
        months = 12

    start_date = timezone.now() - timedelta(days=months * 30)

    revenue_data = (
        Transaction.objects
        .filter(status='COMPLETED', created_at__gte=start_date)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('month')
    )

    return Response({
        'data': [
            {
                'month': item['month'].strftime('%Y-%m'),
                'revenue': float(item['total'] or 0),
                'transactions': item['count'],
            }
            for item in revenue_data
        ],
        'granularity': 'month',
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def user_growth_chart(request):
    """User registration data grouped by date for charting."""
    days = int(request.query_params.get('days', '30'))
    start_date = timezone.now() - timedelta(days=days)

    growth_data = (
        Profile.objects
        .filter(created_at__gte=start_date)
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    return Response({
        'data': [
            {
                'date': item['date'].strftime('%Y-%m-%d'),
                'count': item['count'],
            }
            for item in growth_data
        ]
    })


def _pct_change(current, previous):
    current = float(current or 0)
    previous = float(previous or 0)
    if previous <= 0:
        return 100.0 if current > 0 else 0.0
    return round(((current - previous) / previous) * 100, 1)


@api_view(['GET'])
@permission_classes([IsAuthor])
def author_analytics(request):
    """
    Author-specific analytics — sales, revenue, engagement for their materials.
    """
    profile = request.user.profile
    materials = Material.objects.filter(author=profile)

    total_materials = materials.count()
    total_sales = materials.aggregate(total=Sum('total_sales'))['total'] or 0
    total_revenue = Enrollment.objects.filter(
        material__author=profile,
        status='ACTIVE',
    ).aggregate(total=Sum('amount_paid'))['total'] or 0
    # Calculate weighted average rating based on actual review counts
    avg_rating = MaterialReview.objects.filter(material__author=profile).aggregate(avg=Avg('rating'))['avg'] or 0

    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    enrollments_30 = Enrollment.objects.filter(
        material__author=profile,
        status='ACTIVE',
        purchase_date__gte=thirty_days_ago,
    )
    enrollments_prev_30 = Enrollment.objects.filter(
        material__author=profile,
        status='ACTIVE',
        purchase_date__gte=sixty_days_ago,
        purchase_date__lt=thirty_days_ago,
    )

    recent_revenue = enrollments_30.aggregate(total=Sum('amount_paid'))['total'] or 0
    prev_revenue = enrollments_prev_30.aggregate(total=Sum('amount_paid'))['total'] or 0
    recent_downloads = enrollments_30.count()
    prev_downloads = enrollments_prev_30.count()

    materials_this_month = materials.filter(created_at__gte=month_start).count()
    sales_this_month = enrollments_30.count()

    materials_30 = materials.filter(created_at__gte=thirty_days_ago).count()
    materials_prev_30 = materials.filter(
        created_at__gte=sixty_days_ago,
        created_at__lt=thirty_days_ago,
    ).count()

    enrollment_base = Enrollment.objects.filter(
        material__author=profile,
        status='ACTIVE',
    )
    author_reviews = MaterialReview.objects.filter(material__author=profile)

    category_rows = (
        enrollment_base
        .exclude(material__category='')
        .values('material__category')
        .annotate(revenue=Sum('amount_paid'))
        .order_by('-revenue')
    )
    category_total = sum(float(row['revenue'] or 0) for row in category_rows) or 1
    categories = []
    for row in category_rows[:8]:
        revenue = float(row['revenue'] or 0)
        if revenue <= 0:
            continue
        categories.append({
            'name': row['material__category'] or 'Other',
            'revenue': revenue,
            'pct': round((revenue / category_total) * 100),
        })

    # Per-material breakdown
    material_stats = []
    for material in materials[:20]:
        material_stats.append({
            'id': str(material.id),
            'title': material.title,
            'type': material.type,
            'price': float(material.price),
            'sales': material.total_sales,
            'revenue': float(material.total_sales * material.price),
            'rating': float(material.average_rating),
            'is_approved': material.is_approved,
        })

    # Monthly sales trend
    monthly_sales = (
        Enrollment.objects
        .filter(material__author=profile)
        .annotate(month=TruncMonth('purchase_date'))
        .values('month')
        .annotate(count=Count('id'), revenue=Sum('amount_paid'))
        .order_by('-month')[:12]
    )

    # Daily chart — last 30 days (filled for continuous chart)
    daily_qs = (
        enrollments_30
        .annotate(date=TruncDate('purchase_date'))
        .values('date')
        .annotate(revenue=Sum('amount_paid'), sales=Count('id'))
        .order_by('date')
    )
    daily_map = {item['date']: item for item in daily_qs}
    daily_chart = []
    for offset in range(30):
        day = (now - timedelta(days=29 - offset)).date()
        row = daily_map.get(day)
        daily_chart.append({
            'date': day.strftime('%b %d'),
            'revenue': float(row['revenue'] or 0) if row else 0.0,
            'sales': row['sales'] if row else 0,
        })

    # Top category by sales
    top_category_row = (
        materials.exclude(category='')
        .values('category')
        .annotate(sales=Sum('total_sales'))
        .order_by('-sales')
        .first()
    )
    top_category_name = top_category_row['category'] if top_category_row else ''
    top_category_sales = top_category_row['sales'] if top_category_row else 0
    top_category_pct = (
        round((top_category_sales / total_sales) * 100)
        if total_sales and top_category_sales
        else 0
    )

    # Proxy conversion: recent sales per listing (scaled to a percentage)
    conversion_rate = round(
        (recent_downloads / max(total_materials, 1)) * 8.4,
        1,
    )
    prev_conversion = round(
        (prev_downloads / max(total_materials, 1)) * 8.4,
        1,
    )

    return Response({
        'overview': {
            'total_materials': total_materials,
            'total_sales': total_sales,
            'total_revenue': float(total_revenue),
            'avg_rating': float(avg_rating),
            'materials_this_month': materials_this_month,
            'sales_this_month': sales_this_month,
            'materials_change_pct': _pct_change(materials_30, materials_prev_30),
            'sales_change_pct': _pct_change(recent_downloads, prev_downloads),
            'revenue_change_pct': _pct_change(recent_revenue, prev_revenue),
        },
        'sparklines': {
            'materials': _daily_series(materials, 'created_at'),
            'sales': _daily_series(enrollment_base, 'purchase_date'),
            'revenue': _daily_series(enrollment_base, 'purchase_date', value_field='amount_paid'),
            'ratings': _daily_avg_series(author_reviews, 'created_at', 'rating'),
        },
        'categories': categories,
        'performance': {
            'revenue': float(recent_revenue),
            'revenue_change_pct': _pct_change(recent_revenue, prev_revenue),
            'downloads': recent_downloads,
            'downloads_change_pct': _pct_change(recent_downloads, prev_downloads),
            'top_category': top_category_name,
            'top_category_pct': top_category_pct,
            'conversion_rate': conversion_rate,
            'conversion_change_pct': _pct_change(conversion_rate, prev_conversion),
        },
        'materials': material_stats,
        'monthly_sales': [
            {
                'month': item['month'].strftime('%Y-%m'),
                'sales': item['count'],
                'revenue': float(item['revenue'] or 0),
            }
            for item in monthly_sales
        ],
        'daily_chart': daily_chart,
    })


@api_view(['GET'])
@permission_classes([IsAdmin])
def platform_health(request):
    """Run live probes for admin Platform Health widget."""
    from .health_checks import run_all_health_checks

    return Response(run_all_health_checks())
