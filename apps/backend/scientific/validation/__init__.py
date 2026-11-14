"""Scientific validation of inputs and published results.

Validation records provenance and uncertainty. It does not invent either.
"""

from scientific.exceptions import ScientificNotImplemented


def validate_result(*, dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "Result validation is not implemented. "
        f"No comparison against {dataset_version!r} is fabricated."
    )
