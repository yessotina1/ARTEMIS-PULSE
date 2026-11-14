"""LROC imagery products.

This module records provenance only. It does not download or invent images.
"""

from scientific.exceptions import ScientificNotImplemented


def describe_product(product_id: str) -> None:
    raise ScientificNotImplemented(
        "LROC product access is not implemented. "
        f"No image is fetched for {product_id!r}."
    )
