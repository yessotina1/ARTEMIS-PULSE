from django.utils import timezone

from apps.datasets.models import DataIngestion, Dataset, DatasetVersion
from apps.datasets.nasa import fetch_horizons_metadata

_STATIC_NOTE = (
    "Fiche de provenance enregistrée. Aucune image, aucun DEM et aucune tuile "
    "n'ont été téléchargés."
)


def execute_ingestion(ingestion: DataIngestion, *, fetch_horizons=None) -> DataIngestion:
    """Record NASA source metadata. Science products are out of scope."""

    if ingestion.status == DataIngestion.Status.CANCELLED:
        return ingestion
    fetch = fetch_horizons or fetch_horizons_metadata
    ingestion.status = DataIngestion.Status.RUNNING
    ingestion.started_at = timezone.now()
    ingestion.save(update_fields=["status", "started_at", "updated_at"])
    try:
        if ingestion.source and ingestion.source.code == "horizons":
            _record_horizons(ingestion, fetch())
        else:
            _validate_static_catalog(ingestion)
        ingestion.status = DataIngestion.Status.SUCCEEDED
    except Exception as exc:
        ingestion.status = DataIngestion.Status.FAILED
        ingestion.logs = (ingestion.logs + "\n" if ingestion.logs else "") + str(exc)
    ingestion.finished_at = timezone.now()
    ingestion.save()
    return ingestion


def _record_horizons(ingestion: DataIngestion, meta: dict) -> None:
    dataset = Dataset.objects.get(source=ingestion.source, product_code="horizons_ephemeris")
    version, _created = DatasetVersion.objects.update_or_create(
        dataset=dataset,
        version=meta["version"],
        defaults={
            "status": DatasetVersion.Status.VALIDATED,
            "retrieved_at": timezone.now(),
            "citation": "NASA JPL Horizons API, https://ssd.jpl.nasa.gov/api/horizons.api",
            "uncertainty_notes": (
                "Métadonnées de signature Horizons uniquement. "
                "Aucun vecteur d'état n'est interprété."
            ),
            "metadata": {
                "signature": meta["signature"],
                "result_excerpt": meta["result_excerpt"],
                "source_url": meta["source_url"],
            },
        },
    )
    ingestion.dataset = dataset
    ingestion.logs = (
        f"Signature Horizons enregistrée pour la version {version.version}. "
        "Aucun éphéméride n'a été calculé."
    )


def _validate_static_catalog(ingestion: DataIngestion) -> None:
    now = timezone.now()
    versions = DatasetVersion.objects.filter(dataset__source=ingestion.source)
    updated = 0
    for version in versions:
        if version.status == DatasetVersion.Status.CANDIDATE:
            version.status = DatasetVersion.Status.VALIDATED
            version.retrieved_at = now
            version.save(update_fields=["status", "retrieved_at", "updated_at"])
            updated += 1
    ingestion.logs = f"{_STATIC_NOTE} Versions mises à jour : {updated}."
