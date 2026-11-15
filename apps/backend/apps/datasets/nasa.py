"""Read-only metadata calls. No ephemeris is interpreted and no file is downloaded."""

from __future__ import annotations

import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

HORIZONS_API = "https://ssd.jpl.nasa.gov/api/horizons.api"


def fetch_horizons_metadata(opener=None) -> dict:
    """Ask Horizons for Moon (301) object data, without an ephemeris table."""

    query = urlencode(
        {
            "format": "json",
            "COMMAND": "'301'",
            "OBJ_DATA": "'YES'",
            "MAKE_EPHEM": "'NO'",
        }
    )
    request = Request(
        f"{HORIZONS_API}?{query}",
        headers={"User-Agent": "ARTEMIS-PULSE/0.1 (metadata)"},
    )
    open_url = opener or urlopen
    with open_url(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    if not isinstance(payload, dict):
        raise ValueError("La réponse Horizons n'est pas un objet JSON.")
    signature = payload.get("signature") or {}
    if not isinstance(signature, dict):
        signature = {"raw": str(signature)}
    version = str(signature.get("version") or signature.get("source") or "unversioned")
    result = payload.get("result") or ""
    return {
        "version": version[:128],
        "signature": signature,
        "result_excerpt": str(result)[:500],
        "source_url": HORIZONS_API,
    }
