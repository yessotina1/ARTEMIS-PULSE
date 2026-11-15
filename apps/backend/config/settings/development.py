"""Local development against Neon. No local PostgreSQL is configured."""

from common.db.neon import database_from_url, select_database_url

from .base import *  # noqa: F403
from .base import BASE_DIR, env_bool

DEBUG = env_bool("DJANGO_DEBUG", True)

database_url = select_database_url()
if database_url:
    DATABASES = {"default": database_from_url(database_url)}
else:
    # Neon remains the intended database. SQLite lets the application start
    # before DATABASE_URL is provided. It is not a second PostgreSQL.
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "dev.sqlite3",
        }
    }
