"""Energy estimates.

Theoretical solar energy at the surface is not electrical energy produced by
a power system. No watt-hour figure is returned.
"""

from scientific.exceptions import ScientificNotImplemented


def electrical_energy(*, epoch_start: str, epoch_stop: str) -> None:
    raise ScientificNotImplemented(
        "Electrical energy estimation is not implemented for "
        f"{epoch_start!r} to {epoch_stop!r}. "
        "Incident solar energy is not reported as generated electricity."
    )
