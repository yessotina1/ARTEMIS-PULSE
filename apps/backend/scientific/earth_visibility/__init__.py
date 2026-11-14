"""Geometric visibility of Earth from a lunar site.

Geometric visibility is not a radio link budget and is not a communication
window.
"""

from scientific.exceptions import ScientificNotImplemented


def geometric_visibility(*, epoch: str, dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "Earth geometric visibility is not implemented for "
        f"{epoch!r} ({dataset_version!r})."
    )
