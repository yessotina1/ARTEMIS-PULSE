"""NAIF SPICE kernel access via SpiceyPy.

Kernel loading and geometry calls are intentionally absent.
"""

from scientific.exceptions import ScientificNotImplemented


def load_kernels(paths: list[str]) -> None:
    raise ScientificNotImplemented(
        "SPICE kernel loading is not implemented. "
        f"Requested {len(paths)} kernel path(s); none were opened."
    )
