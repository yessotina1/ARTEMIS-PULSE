"""Communication windows.

A window requires geometric Earth visibility and a link budget. Neither is
inferred from the other.
"""

from scientific.exceptions import ScientificNotImplemented


def communication_windows(*, epoch_start: str, epoch_stop: str) -> None:
    raise ScientificNotImplemented(
        "Communication windows are not implemented for "
        f"{epoch_start!r} to {epoch_stop!r}. "
        "Geometric visibility is not reported as link availability."
    )
