"""Local development against Neon. No local PostgreSQL is configured."""

from django.core.exceptions import ImproperlyConfigured

from common.db.neon import database_from_url, select_database_url

from .base import *  # noqa: F403
from .base import env_bool

DEBUG = env_bool("DJANGO_DEBUG", True)

database_url = select_database_url()
if not database_url:
    raise ImproperlyConfigured(
        "DATABASE_URL (Neon pooler) is required. "
        "DATABASE_URL_DIRECT is required for migrations. "
        "Copy .env.example to .env and fill the Neon connection strings."
    )

DATABASES = {"default": database_from_url(database_url)}
