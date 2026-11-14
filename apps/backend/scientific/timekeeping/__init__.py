"""Time scales used by lunar geometry.

UTC, TDB, and spacecraft clocks are not interchangeable. Conversions are not
implemented and no ephemeris time is guessed.
"""

from scientific.exceptions import ScientificNotImplemented


def to_tdb(utc_iso: str) -> None:
    raise ScientificNotImplemented(
        f"UTC to TDB conversion is not implemented for {utc_iso!r}."
    )
