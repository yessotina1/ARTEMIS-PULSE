"""Parse Neon connection URLs for Django.

PostgreSQL 17 is the targeted Neon major version: the Neon extension catalog
(updated 2026-11-04) lists PostGIS 3.5.7 for PostgreSQL 17. PostgreSQL 18 is
also available there with PostGIS 3.6.4. No lunar coordinate is assigned a
terrestrial SRID.
"""

from __future__ import annotations

import os
import sys
from urllib.parse import parse_qs, unquote, urlparse

from django.core.exceptions import ImproperlyConfigured

MIGRATION_COMMANDS = frozenset({"migrate", "dbshell", "flush", "sqlmigrate"})


def env(name: str, default: str | None = None) -> str | None:
    value = os.environ.get(name)
    if value is None or value.strip() == "":
        return default
    return value


def select_database_url() -> str | None:
    """Prefer the direct Neon endpoint for migrations.

    The pooled endpoint (PgBouncer, transaction mode) cannot be used for
    migrations. ``DATABASE_URL`` is the application pooler URL.
    ``DATABASE_URL_DIRECT`` is the direct compute URL.
    """

    direct = env("DATABASE_URL_DIRECT")
    pooled = env("DATABASE_URL")
    use_direct = env("DJANGO_USE_DIRECT_DATABASE") == "1" or any(
        command in sys.argv for command in MIGRATION_COMMANDS
    )
    if use_direct and direct:
        return direct
    return pooled or direct


def database_from_url(url: str) -> dict[str, object]:
    parsed = urlparse(url)
    if parsed.scheme not in {"postgres", "postgresql"}:
        raise ImproperlyConfigured("Neon URLs must use the postgresql scheme.")
    if not parsed.hostname or parsed.path in {"", "/"}:
        raise ImproperlyConfigured("Database URL is missing a host or database name.")

    sslmode = parse_qs(parsed.query).get("sslmode", ["require"])[0]
    if sslmode == "disable":
        raise ImproperlyConfigured("SSL cannot be disabled for Neon.")

    attempts = int(env("DATABASE_CONNECT_ATTEMPTS", "3") or "3")
    delay = float(env("DATABASE_CONNECT_RETRY_DELAY", "1.5") or "1.5")
    timeout = int(env("DATABASE_CONNECT_TIMEOUT", "15") or "15")

    return {
        "ENGINE": "common.db.backends.neon",
        "NAME": unquote(parsed.path.lstrip("/")),
        "USER": unquote(parsed.username or ""),
        "PASSWORD": unquote(parsed.password or ""),
        "HOST": parsed.hostname,
        "PORT": str(parsed.port or 5432),
        # PgBouncer transaction mode rejects persistent connections and
        # server-side cursors. Age 0 also avoids reusing a socket after Neon
        # suspends the compute.
        "CONN_MAX_AGE": 0,
        "CONN_HEALTH_CHECKS": True,
        "DISABLE_SERVER_SIDE_CURSORS": True,
        "CONNECT_ATTEMPTS": attempts,
        "CONNECT_RETRY_DELAY": delay,
        "OPTIONS": {
            "sslmode": sslmode,
            "connect_timeout": timeout,
        },
    }
