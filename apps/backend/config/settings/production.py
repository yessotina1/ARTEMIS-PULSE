"""Production settings. Secrets come from the environment only."""

from django.core.exceptions import ImproperlyConfigured

from common.db.neon import database_from_url, select_database_url

from .base import *  # noqa: F403
from .base import env

DEBUG = False

secret = env("DJANGO_SECRET_KEY")
if not secret or secret == "unsafe-development-placeholder":
    raise ImproperlyConfigured("DJANGO_SECRET_KEY must be set to a unique production secret.")
SECRET_KEY = secret

allowed_hosts = env("DJANGO_ALLOWED_HOSTS")
if not allowed_hosts:
    raise ImproperlyConfigured("DJANGO_ALLOWED_HOSTS is required in production.")

database_url = select_database_url()
if not database_url:
    raise ImproperlyConfigured("DATABASE_URL is required in production.")

DATABASES = {"default": database_from_url(database_url)}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
