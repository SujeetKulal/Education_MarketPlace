"""
Platform health probes for the admin dashboard.
Each checker returns: status, message, latency_ms (optional).
Status: healthy | degraded | down | unconfigured
"""
import os
import smtplib
import ssl
import time

import requests
from django.conf import settings
from django.db import connection


def _result(status, message, latency_ms=None):
    payload = {'status': status, 'message': message}
    if latency_ms is not None:
        payload['latency_ms'] = round(latency_ms, 1)
    return payload


def check_server():
    """API process is running (this probe executes inside it)."""
    start = time.monotonic()
    latency = (time.monotonic() - start) * 1000
    return _result('healthy', 'API server is responding', latency)


def check_database():
    """Verify the configured Django database accepts queries."""
    start = time.monotonic()
    try:
        connection.ensure_connection()
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
            cursor.fetchone()
        engine = connection.settings_dict.get('ENGINE', '').split('.')[-1]
        label = 'PostgreSQL' if 'postgresql' in engine else 'SQLite'
        latency = (time.monotonic() - start) * 1000
        return _result('healthy', f'{label} database connected', latency)
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return _result('down', f'Database unreachable: {exc}', latency)


def check_payments():
    """Commerce tables reachable; gateway configured if env vars are set."""
    start = time.monotonic()
    gateway = None
    if os.getenv('RAZORPAY_KEY_ID'):
        gateway = 'Razorpay'
    elif os.getenv('STRIPE_SECRET_KEY'):
        gateway = 'Stripe'

    try:
        from commerce.models import Transaction

        Transaction.objects.values('id')[:1]
        latency = (time.monotonic() - start) * 1000
        if gateway:
            return _result('healthy', f'Payment records OK ({gateway} configured)', latency)
        return _result(
            'degraded',
            'Commerce DB OK; purchases use simulated flow (no payment gateway env vars)',
            latency,
        )
    except Exception as exc:
        latency = (time.monotonic() - start) * 1000
        return _result('down', f'Payment system check failed: {exc}', latency)


def check_storage():
    """Ping Supabase Storage API (bucket list)."""
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        return _result('unconfigured', 'Supabase storage credentials not set')

    start = time.monotonic()
    url = f'{settings.SUPABASE_URL.rstrip("/")}/storage/v1/bucket'
    headers = {
        'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': settings.SUPABASE_ANON_KEY or settings.SUPABASE_SERVICE_ROLE_KEY,
    }
    try:
        response = requests.get(url, headers=headers, timeout=8)
        latency = (time.monotonic() - start) * 1000
        if response.status_code == 200:
            count = len(response.json()) if isinstance(response.json(), list) else 0
            return _result('healthy', f'Supabase Storage reachable ({count} bucket(s))', latency)
        return _result(
            'degraded',
            f'Storage API returned HTTP {response.status_code}',
            latency,
        )
    except requests.RequestException as exc:
        latency = (time.monotonic() - start) * 1000
        return _result('down', f'Storage unreachable: {exc}', latency)


def check_email():
    """
    SMTP if EMAIL_HOST is set; otherwise Supabase Auth health (handles auth emails).
    """
    email_host = os.getenv('EMAIL_HOST', '').strip()
    if email_host:
        start = time.monotonic()
        port = int(os.getenv('EMAIL_PORT', '587'))
        use_tls = os.getenv('EMAIL_USE_TLS', 'true').lower() in ('true', '1', 'yes')
        username = os.getenv('EMAIL_HOST_USER', '')
        password = os.getenv('EMAIL_HOST_PASSWORD', '')
        try:
            if use_tls:
                server = smtplib.SMTP(email_host, port, timeout=8)
                server.starttls(context=ssl.create_default_context())
            else:
                server = smtplib.SMTP_SSL(email_host, port, timeout=8)
            if username:
                server.login(username, password)
            server.quit()
            latency = (time.monotonic() - start) * 1000
            return _result('healthy', f'SMTP server {email_host} reachable', latency)
        except Exception as exc:
            latency = (time.monotonic() - start) * 1000
            return _result('down', f'SMTP connection failed: {exc}', latency)

    if settings.SUPABASE_URL:
        start = time.monotonic()
        url = f'{settings.SUPABASE_URL.rstrip("/")}/auth/v1/health'
        try:
            response = requests.get(url, timeout=8)
            latency = (time.monotonic() - start) * 1000
            if response.status_code == 200:
                return _result(
                    'healthy',
                    'Supabase Auth reachable (handles sign-up / reset emails)',
                    latency,
                )
            return _result(
                'degraded',
                f'Supabase Auth health returned HTTP {response.status_code}',
                latency,
            )
        except requests.RequestException as exc:
            latency = (time.monotonic() - start) * 1000
            return _result('down', f'Auth/email service unreachable: {exc}', latency)

    return _result('unconfigured', 'No EMAIL_HOST or Supabase URL configured for email')


def run_all_health_checks():
    checks = [
        ('server', 'Server Status', check_server),
        ('database', 'Database', check_database),
        ('payments', 'Payments', check_payments),
        ('storage', 'Storage', check_storage),
        ('email', 'Email Services', check_email),
    ]
    services = []
    overall = 'healthy'
    rank = {'healthy': 0, 'unconfigured': 1, 'degraded': 2, 'down': 3}

    for key, label, fn in checks:
        result = fn()
        result['id'] = key
        result['label'] = label
        services.append(result)
        if rank.get(result['status'], 0) > rank.get(overall, 0):
            overall = result['status']

    return {
        'overall': overall,
        'checked_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'services': services,
    }
