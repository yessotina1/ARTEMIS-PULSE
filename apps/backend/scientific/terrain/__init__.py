"""Terrain and elevation models.

Elevation samples are not a complete obstruction model.
"""

from scientific.exceptions import ScientificNotImplemented


def sample_elevation(*, dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "Terrain sampling is not implemented. "
        f"No elevation is interpolated from {dataset_version!r}."
    )
