"""LOLA elevation products.

A DEM path is metadata. Reading it is not an illumination or horizon product.
"""

from scientific.exceptions import ScientificNotImplemented


def describe_dem(dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "LOLA DEM access is not implemented. "
        f"No elevation grid is loaded for version {dataset_version!r}."
    )
