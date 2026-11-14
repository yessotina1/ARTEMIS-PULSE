"""Dependency checks that report state without inventing a success."""

from __future__ import annotations

from django.conf import settings
from django.db import connection
from django.db.utils import OperationalError


def database_status() -> str:
    engine = settings.DATABASES["default"]["ENGINE"]
    if engine.endswith("sqlite3"):
        return "sqlite-test"
    try:
        connection.ensure_connection()
    except OperationalError:
        return "unavailable"
    except Exception:
        return "error"
    if connection.vendor != "postgresql":
        return "unexpected-vendor"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.execute("SELECT extversion FROM pg_extension WHERE extname = 'postgis'")
            row = cursor.fetchone()
    except Exception:
        return "connected"
    return "postgis" if row else "connected-without-postgis"


def redis_status() -> str:
    url = getattr(settings, "REDIS_URL", "") or ""
    if not url:
        return "unconfigured"
    try:
        import redis
    except ImportError:
        return "client-missing"
    try:
        client = redis.Redis.from_url(url, socket_connect_timeout=2)
        client.ping()
    except Exception:
        return "unavailable"
    return "ok"


def health_payload() -> dict[str, str]:
    database = database_status()
    redis_state = redis_status()
    ready = database in {"postgis", "sqlite-test"} and redis_state in {"ok", "unconfigured"}
    return {
        "status": "ok" if ready else "degraded",
        "database": database,
        "redis": redis_state,
    }
