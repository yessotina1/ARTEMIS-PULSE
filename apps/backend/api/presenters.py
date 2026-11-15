"""Map persisted records to the web contract.

Computed illumination, visibility and energy stay null. A missing calculation
is not replaced by a number.
"""

from __future__ import annotations

from datetime import datetime

from apps.accounts.models import User
from apps.analyses.models import AnalysisJob, AnalysisScenario, ProcessingStatus
from apps.catalog.models import LunarSite

UNCOMPUTED_SOURCE = {
    "source": "non calculé",
    "version": "aucune",
    "model": None,
}
USER_INPUT_SOURCE = {
    "source": "saisie utilisateur",
    "version": "aucune",
    "model": None,
}
SITE_CATEGORIES = {"RIDGE", "PLATEAU", "CRATER_RIM", "PSR", "HISTORIC", "CUSTOM"}
PROFILE_BY_ROLE = {
    User.Role.MISSION_PLANNER: "PLANNER",
    User.Role.EDUCATOR: "EDUCATOR",
    User.Role.PUBLIC: "EXPLORER",
}
ROLE_BY_PROFILE = {profile: role for role, profile in PROFILE_BY_ROLE.items()}
RUN_STATUS = {
    ProcessingStatus.DRAFT: "FAILED",
    ProcessingStatus.QUEUED: "QUEUED",
    ProcessingStatus.RUNNING: "RUNNING",
    ProcessingStatus.SUCCEEDED: "SUCCEEDED",
    ProcessingStatus.FAILED: "FAILED",
    ProcessingStatus.CANCELLED: "FAILED",
}
SCENARIO_STATUS = {
    ProcessingStatus.QUEUED: "QUEUED",
    ProcessingStatus.RUNNING: "RUNNING",
    ProcessingStatus.SUCCEEDED: "READY",
    ProcessingStatus.FAILED: "FAILED",
    ProcessingStatus.CANCELLED: "FAILED",
}


def iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat().replace("+00:00", "Z")


def auth_user(user: User) -> dict:
    full_name = user.get_full_name().strip() or user.username
    affiliation = ""
    profile = getattr(user, "profile", None)
    if profile is not None:
        affiliation = profile.affiliation
    payload = {
        "id": str(user.pk),
        "email": user.email,
        "fullName": full_name,
        "profile": PROFILE_BY_ROLE.get(user.role, "EXPLORER"),
    }
    if affiliation:
        payload["organization"] = affiliation
    return payload


def site_summary(site: LunarSite) -> dict:
    characteristics = site.characteristics if isinstance(site.characteristics, dict) else {}
    category = characteristics.get("category")
    tags = characteristics.get("tags") if isinstance(characteristics.get("tags"), list) else []
    return {
        "id": str(site.id),
        "slug": site.slug,
        "name": site.name,
        "designation": characteristics.get("designation") or site.slug,
        "category": category if category in SITE_CATEGORIES else "CUSTOM",
        "mission": characteristics.get("mission") or "",
        "coordinates": {
            "latitudeDeg": float(site.latitude_deg) if site.latitude_deg is not None else None,
            "longitudeDeg": float(site.longitude_deg) if site.longitude_deg is not None else None,
            "altitudeM": float(site.elevation_m) if site.elevation_m is not None else None,
        },
        "quality": "UNCOMPUTABLE",
        "dem": {
            "status": "NONE",
            "resolutionM": None,
            "source": None,
            "note": "Aucun modèle numérique de terrain n'est associé à ce site.",
        },
        "illuminationPercent": None,
        "maxContinuousDarknessHours": None,
        "tags": tags,
        "referenceEphemerisUtc": None,
    }


def site_detail(site: LunarSite) -> dict:
    payload = site_summary(site)
    payload.update(
        {
            "description": site.description,
            "referenceState": {
                "atUtc": None,
                "sun": {"azimuthDeg": None, "elevationDeg": None},
                "earth": {"azimuthDeg": None, "elevationDeg": None},
                "sunVisibility": "UNKNOWN",
                "earthVisibility": "UNKNOWN",
                "solarFluxWm2": None,
                "quality": "UNCOMPUTABLE",
                "source": UNCOMPUTED_SOURCE,
            },
            "horizonProfile": None,
            "sceneImageUrl": None,
            "illustrationUrl": None,
        }
    )
    return payload


def scenario_payload(scenario: AnalysisScenario) -> dict:
    parameters = scenario.parameters if isinstance(scenario.parameters, dict) else {}
    latest = scenario.jobs.order_by("-created_at").first()
    return {
        "id": str(scenario.id),
        "name": scenario.title,
        "siteId": str(scenario.site_id) if scenario.site_id else "",
        "siteName": scenario.site.name if scenario.site_id else "",
        "observer": parameters.get("observer")
        or {"name": scenario.title, "heightM": 0, "mode": "SITE_SURFACE"},
        "window": parameters.get("window")
        or {"startUtc": None, "endUtc": None, "stepSeconds": None, "steps": None},
        "status": SCENARIO_STATUS.get(latest.status, "DRAFT") if latest else "DRAFT",
        "quality": "UNCOMPUTABLE",
        "createdAt": iso(scenario.created_at),
        "updatedAt": iso(scenario.updated_at),
        "lastRunId": str(latest.id) if latest else None,
        "tags": parameters.get("tags") if isinstance(parameters.get("tags"), list) else [],
        "notes": scenario.notes,
        "owner": scenario.owner.get_full_name() or scenario.owner.username,
        "source": USER_INPUT_SOURCE,
    }


def run_payload(job: AnalysisJob) -> dict:
    failed = job.status in {ProcessingStatus.FAILED, ProcessingStatus.CANCELLED, ProcessingStatus.DRAFT}
    return {
        "id": str(job.id),
        "scenarioId": str(job.scenario_id),
        "status": RUN_STATUS.get(job.status, "FAILED"),
        "progressPercent": job.progress,
        "submittedAtUtc": iso(job.created_at),
        "startedAtUtc": iso(job.started_at),
        "finishedAtUtc": iso(job.finished_at),
        "quality": "UNCOMPUTABLE",
        "source": UNCOMPUTED_SOURCE,
        "error": (
            {
                "code": "NOT_COMPUTED",
                "message": job.error_message
                or "Aucun résultat scientifique n'a été calculé pour cette exécution.",
            }
            if failed
            else None
        ),
        "summary": None,
    }
