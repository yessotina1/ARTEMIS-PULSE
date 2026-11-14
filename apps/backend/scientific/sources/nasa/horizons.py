"""JPL Horizons ephemeris access.

This adapter does not call Horizons and does not invent state vectors.
"""

from scientific.exceptions import ScientificNotImplemented


def fetch_ephemeris(*, target: str, start: str, stop: str) -> None:
    raise ScientificNotImplemented(
        "The Horizons client is not implemented. No ephemeris is returned for "
        f"target={target!r}, start={start!r}, stop={stop!r}."
    )
