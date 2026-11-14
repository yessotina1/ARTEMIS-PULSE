"""Lunar coordinates and reference frames.

No frame in this package is declared equivalent to WGS84 or EPSG:4326.
A lunar frame may be adopted only after its definition, prime meridian, and
dataset version are documented.
"""

from scientific.exceptions import ScientificNotImplemented

REJECTED_TERRESTRIAL_FRAMES = frozenset({"4326", "EPSG:4326", "WGS84", "wgs84"})


def assert_lunar_frame(frame: str) -> None:
    if frame in REJECTED_TERRESTRIAL_FRAMES:
        raise ValueError(f"{frame} is a terrestrial frame and cannot label a lunar position.")


def transform(*, source_frame: str, target_frame: str) -> None:
    assert_lunar_frame(source_frame)
    assert_lunar_frame(target_frame)
    raise ScientificNotImplemented(
        "Lunar frame transformation is not implemented "
        f"({source_frame} -> {target_frame})."
    )
