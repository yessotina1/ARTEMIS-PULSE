"""Terrain-aware solar illumination.

The apparent solar position is not the illumination of the terrain. This
module must not report an illumination fraction until both the ephemeris and
the horizon profile exist for the same frame, epoch, and DEM version.
"""

from scientific.exceptions import ScientificNotImplemented


def illumination_fraction(*, epoch: str, dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "Solar illumination is not implemented. Apparent Sun position is not "
        f"substituted for terrain illumination at {epoch!r} ({dataset_version!r})."
    )
