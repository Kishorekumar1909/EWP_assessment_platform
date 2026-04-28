from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings


class CookieJWTAuthentication(JWTAuthentication):
    """
    Custom JWT authentication that reads the access token from an
    HTTP-only cookie instead of the Authorization header.
    Falls back to header-based auth if cookie is not present.
    """

    def authenticate(self, request):
        cookie_name = settings.SIMPLE_JWT.get('AUTH_COOKIE', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            # Fall back to header-based auth (useful for testing with curl/Postman)
            return super().authenticate(request)

        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            # If the token is invalid (expired, tampered with, etc.),
            # return None so the user is treated as anonymous.
            # This allows views with AllowAny (like Login/Logout) to still function.
            return None
