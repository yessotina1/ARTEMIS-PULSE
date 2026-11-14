"""Ephemeris products derived from Horizons or SPICE.

Apparent direction is not a terrain illumination result.
"""

from scientific.exceptions import ScientificNotImplemented


def sun_direction(*, frame: str, epoch: str) -> None:
    raise ScientificNotImplemented(
        "Solar ephemeris is not implemented. "
        f"No Sun direction is produced for frame={frame!r} at {epoch!r}."
    )


def earth_direction(*, frame: str, epoch: str) -> None:
    raise ScientificNotImplemented(
        "Earth ephemeris is not implemented. "
        f"No Earth direction is produced for frame={frame!r} at {epoch!r}."
    )
