"""Dispatch a stored scenario to the scientific engine.

Every current runner raises ScientificNotImplemented. The job is still
recorded so the pipeline, status, and error path can be exercised.
"""

from __future__ import annotations

from apps.analyses.models import AnalysisScenario
from scientific.communications import communication_windows
from scientific.earth_visibility import geometric_visibility
from scientific.energy import electrical_energy
from scientific.exceptions import ScientificNotImplemented
from scientific.solar import illumination_fraction


def execute_scenario(scenario: AnalysisScenario) -> None:
    parameters = scenario.parameters or {}
    domain = parameters.get("domain")
    epoch = str(parameters.get("epoch", ""))
    epoch_start = str(parameters.get("epoch_start", epoch))
    epoch_stop = str(parameters.get("epoch_stop", epoch))
    dataset_version = str(parameters.get("dataset_version", ""))

    if domain == "solar":
        illumination_fraction(epoch=epoch, dataset_version=dataset_version)
        return
    if domain == "earth_visibility":
        geometric_visibility(epoch=epoch, dataset_version=dataset_version)
        return
    if domain == "communications":
        communication_windows(epoch_start=epoch_start, epoch_stop=epoch_stop)
        return
    if domain == "energy":
        electrical_energy(epoch_start=epoch_start, epoch_stop=epoch_stop)
        return
    raise ScientificNotImplemented(
        "No scientific calculation is implemented for this scenario. "
        "The request is stored and no result is produced."
    )
