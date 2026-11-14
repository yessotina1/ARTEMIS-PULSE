"""PostGIS backend with retries for Neon compute wake-ups."""

from __future__ import annotations

import time

from django.contrib.gis.db.backends.postgis.base import (
    DatabaseWrapper as PostGISDatabaseWrapper,
)
from django.db.utils import OperationalError


class DatabaseWrapper(PostGISDatabaseWrapper):
    def get_new_connection(self, conn_params):
        attempts = int(self.settings_dict.get("CONNECT_ATTEMPTS", 3))
        delay = float(self.settings_dict.get("CONNECT_RETRY_DELAY", 1.5))
        last_error: OperationalError | None = None
        for attempt in range(1, attempts + 1):
            try:
                return super().get_new_connection(conn_params)
            except OperationalError as exc:
                last_error = exc
                if attempt >= attempts:
                    raise
                time.sleep(delay * attempt)
        raise last_error
