"""
Custom Supabase JWT authentication backend for DRF.
Verifies JWT tokens issued by Supabase Auth.
"""
import jwt
import logging
import requests
from django.conf import settings
from rest_framework import authentication, exceptions
from rest_framework.authentication import get_authorization_header
from .models import Profile

logger = logging.getLogger(__name__)


class SupabaseUser:
    """Lightweight user object wrapping Supabase JWT claims."""
    def __init__(self, payload, profile=None):
        self.id = payload.get('sub')
        self.email = payload.get('email', '')
        self.payload = payload
        self.profile = profile
        self.is_authenticated = True

    def __str__(self):
        return self.email or self.id


class SupabaseAuthentication(authentication.BaseAuthentication):
    """
    Authenticates requests using Supabase JWT tokens.
    Expects: Authorization: Bearer <supabase-jwt>
    """

    _jwks_cache = None
    _jwks_cache_url = None

    @staticmethod
    def _extract_token(request):
        def _mask(value):
            if not value:
                return value
            if len(value) <= 24:
                return value
            return f"{value[:12]}...{value[-8:]}"

        # Primary parser (DRF standard)
        auth = get_authorization_header(request).split()
        logger.debug(
            "SupabaseAuth header debug: drf_auth_parts=%s request_header_auth=%s meta_http_auth=%s meta_auth=%s",
            [part.decode('utf-8', errors='ignore') for part in auth] if auth else [],
            _mask((request.headers.get('Authorization') or '')),
            _mask((request.META.get('HTTP_AUTHORIZATION') or '')),
            _mask((request.META.get('AUTHORIZATION') or '')),
        )
        if auth and auth[0].lower() == b'bearer':
            if len(auth) == 1:
                raise exceptions.AuthenticationFailed('Invalid Authorization header: No credentials provided.')
            if len(auth) > 2:
                raise exceptions.AuthenticationFailed('Invalid Authorization header: Token string should not contain spaces.')
            try:
                return auth[1].decode('utf-8')
            except UnicodeError:
                raise exceptions.AuthenticationFailed('Invalid Authorization header: Token is not valid UTF-8.')

        # Fallbacks for environments that don't expose HTTP_AUTHORIZATION in META.
        raw_header = (
            request.headers.get('Authorization')
            or request.META.get('HTTP_AUTHORIZATION')
            or request.META.get('AUTHORIZATION')
            or request.META.get('REDIRECT_HTTP_AUTHORIZATION')
            or ''
        )
        if not raw_header:
            logger.debug("SupabaseAuth: no Authorization header found by fallback extractors.")
            return None
        if not raw_header.lower().startswith('bearer '):
            logger.debug("SupabaseAuth: non-bearer Authorization header received.")
            return None
        token = raw_header[7:].strip()
        if not token:
            raise exceptions.AuthenticationFailed('Invalid Authorization header: No credentials provided.')
        logger.debug("SupabaseAuth: extracted bearer token via fallback parser: %s", _mask(token))
        return token

    @classmethod
    def _fetch_jwks(cls):
        jwks_url = getattr(settings, 'SUPABASE_JWKS_URL', '')
        if not jwks_url:
            raise exceptions.AuthenticationFailed('Supabase JWKS URL is not configured.')

        if cls._jwks_cache is not None and cls._jwks_cache_url == jwks_url:
            return cls._jwks_cache

        session = requests.Session()
        session.trust_env = False  # Ignore broken HTTP(S)_PROXY env settings.
        response = session.get(jwks_url, timeout=8)
        response.raise_for_status()
        jwks_data = response.json()

        keys = jwks_data.get('keys') if isinstance(jwks_data, dict) else None
        if not keys:
            raise exceptions.AuthenticationFailed('Supabase JWKS response did not contain signing keys.')

        cls._jwks_cache = jwks_data
        cls._jwks_cache_url = jwks_url
        return jwks_data

    @classmethod
    def _get_signing_key_for_token(cls, token):
        header = jwt.get_unverified_header(token)
        kid = header.get('kid')
        if not kid:
            raise exceptions.AuthenticationFailed('Token header missing key ID (kid).')

        jwks = cls._fetch_jwks()
        for jwk_dict in jwks.get('keys', []):
            if jwk_dict.get('kid') == kid:
                return jwt.PyJWK.from_dict(jwk_dict).key

        # Refresh once in case keys rotated.
        cls._jwks_cache = None
        jwks = cls._fetch_jwks()
        for jwk_dict in jwks.get('keys', []):
            if jwk_dict.get('kid') == kid:
                return jwt.PyJWK.from_dict(jwk_dict).key

        raise exceptions.AuthenticationFailed('No matching signing key found for token.')

    def authenticate(self, request):
        token = self._extract_token(request)
        if not token:
            logger.debug("SupabaseAuth: token extraction returned None.")
            return None

        try:
            signing_key = self._get_signing_key_for_token(token)
        except Exception:
            logger.exception("SupabaseAuth: failed to resolve signing key from JWKS.")
            # Any JWKS/key lookup issue should be treated as an auth failure, not a server error.
            raise exceptions.AuthenticationFailed('Unable to validate token signing key.')

        try:
            unverified_header = jwt.get_unverified_header(token)
            token_alg = unverified_header.get('alg')
            allowed_algorithms = getattr(settings, 'SUPABASE_JWT_ALLOWED_ALGORITHMS', ['RS256', 'ES256'])
            if token_alg not in allowed_algorithms:
                logger.warning(
                    "SupabaseAuth: unsupported token algorithm. alg=%s allowed=%s",
                    token_alg,
                    allowed_algorithms,
                )
                raise exceptions.AuthenticationFailed('Unsupported token algorithm.')

            payload = jwt.decode(
                token,
                signing_key,
                algorithms=[token_alg],
                issuer=getattr(settings, 'SUPABASE_JWT_ISSUER', None) or None,
                options={'verify_aud': False},
            )
        except jwt.ExpiredSignatureError:
            logger.warning("SupabaseAuth: token expired.")
            raise exceptions.AuthenticationFailed('Token has expired.')
        except jwt.InvalidIssuerError:
            logger.warning("SupabaseAuth: invalid token issuer.")
            raise exceptions.AuthenticationFailed('Invalid token issuer.')
        except jwt.InvalidTokenError:
            logger.exception("SupabaseAuth: invalid token during jwt.decode.")
            raise exceptions.AuthenticationFailed('Invalid token.')
        except Exception:
            logger.exception("SupabaseAuth: unexpected token validation failure.")
            raise exceptions.AuthenticationFailed('Token validation failed.')

        # Supabase access tokens should target the "authenticated" audience.
        expected_aud = getattr(settings, 'SUPABASE_JWT_AUDIENCE', 'authenticated')
        token_aud = payload.get('aud')
        if isinstance(token_aud, list):
            audience_ok = expected_aud in token_aud
        else:
            audience_ok = token_aud == expected_aud
        if not audience_ok:
            logger.warning("SupabaseAuth: invalid audience. token_aud=%s expected=%s", token_aud, expected_aud)
            raise exceptions.AuthenticationFailed('Invalid token audience.')

        user_id = payload.get('sub')
        if not user_id:
            logger.warning("SupabaseAuth: token missing sub claim.")
            raise exceptions.AuthenticationFailed('Token missing user ID.')

        # Get or create profile
        profile, _ = Profile.objects.get_or_create(
            supabase_id=user_id,
            defaults={
                'email': payload.get('email', ''),
                'role': Profile.Role.STUDENT,
            }
        )
        # Keep email synchronized when available.
        token_email = payload.get('email')
        if token_email and profile.email != token_email:
            profile.email = token_email
            profile.save(update_fields=['email'])

        user = SupabaseUser(payload, profile=profile)
        logger.debug("SupabaseAuth: authentication succeeded for supabase_id=%s", user_id)
        return (user, token)

    def authenticate_header(self, request):
        return 'Bearer'
