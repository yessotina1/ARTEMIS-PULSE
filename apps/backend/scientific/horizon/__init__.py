"""Local horizon profiles from a digital elevation model.

An elevation value at a site is not a horizon profile.
"""

from scientific.exceptions import ScientificNotImplemented


def build_profile(*, dataset_version: str) -> None:
    raise ScientificNotImplemented(
        "Horizon profiling is not implemented. "
        f"No skyline is derived from {dataset_version!r}."
    )
