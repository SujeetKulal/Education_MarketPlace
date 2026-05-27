"""
Supabase Storage helper for generating signed URLs.
"""
import requests
from django.conf import settings


def generate_signed_url(file_path, bucket='private-materials', expires_in=3600):
    """
    Generate a time-limited signed URL for a file in Supabase Storage.

    Args:
        file_path: Path to the file within the bucket.
        bucket: Supabase storage bucket name.
        expires_in: URL validity duration in seconds (default 1 hour).

    Returns:
        Signed URL string or None if failed.
    """
    url = f'{settings.SUPABASE_URL}/storage/v1/object/sign/{bucket}/{file_path}'
    headers = {
        'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': settings.SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
    }
    payload = {'expiresIn': expires_in}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        signed_url = data.get('signedURL', '')
        if signed_url:
            return f"{settings.SUPABASE_URL}/storage/v1{signed_url}"
        return None
    except requests.RequestException:
        return None


def upload_to_supabase(file_obj, file_path, bucket='private-materials', content_type='application/octet-stream'):
    """
    Upload a file to Supabase Storage.

    Args:
        file_obj: Django file object.
        file_path: Destination path in the bucket.
        bucket: Supabase storage bucket name.
        content_type: MIME type of the file.

    Returns:
        File path in the bucket or None if failed.
    """
    url = f'{settings.SUPABASE_URL}/storage/v1/object/{bucket}/{file_path}'
    headers = {
        'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
        'apikey': settings.SUPABASE_ANON_KEY,
        'Content-Type': content_type,
        'x-upsert': 'true',
    }

    try:
        response = requests.post(url, data=file_obj.read(), headers=headers, timeout=120)
        response.raise_for_status()
        return file_path
    except requests.RequestException:
        return None
