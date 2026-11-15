import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q

from common.frames import LUNAR_MEAN_EARTH, TERRESTRIAL_FRAMES
from common.models import TimeStampedModel


class DataSource(TimeStampedModel):
    class Code(models.TextChoices):
        HORIZONS = "horizons", "JPL Horizons"
        QUICKMAP = "quickmap", "LROC Quickmap"
        MOON_TREK = "moon_trek", "NASA Moon Trek"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=32, choices=Code.choices, unique=True)
    name = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    homepage_url = models.URLField(max_length=500)
    api_base_url = models.URLField(max_length=500)
    terms = models.TextField(blank=True)
    documentation_url = models.URLField(max_length=500, blank=True)
    connection_spec = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["code"]

    def __str__(self) -> str:
        return self.name


class Dataset(TimeStampedModel):
    class Product(models.TextChoices):
        HORIZONS_EPHEMERIS = "horizons_ephemeris", "Métadonnées Horizons"
        LROC_NAC = "lroc_nac", "LROC NAC"
        LROC_WAC = "lroc_wac", "LROC WAC"
        LOLA_DEM = "lola_dem", "LOLA DEM"
        MOON_TREK_LOLA = "moon_trek_lola", "Couche Moon Trek LOLA"
        MOON_TREK_LROC = "moon_trek_lroc", "Couche Moon Trek LROC"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(DataSource, on_delete=models.PROTECT, related_name="datasets")
    name = models.CharField(max_length=255)
    product_code = models.CharField(max_length=64, choices=Product.choices)
    description = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "product_code"],
                name="datasets_unique_source_product",
            )
        ]
        indexes = [models.Index(fields=["product_code"])]

    def __str__(self) -> str:
        return self.name


class DatasetVersion(TimeStampedModel):
    class Status(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        VALIDATED = "validated", "Validée"
        RETIRED = "retired", "Retirée"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="versions")
    version = models.CharField(max_length=128)
    retrieved_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.CANDIDATE)
    citation = models.TextField(blank=True)
    uncertainty_notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    storage_uri = models.URLField(max_length=500, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["dataset", "version"],
                name="datasets_unique_dataset_version",
            )
        ]
        indexes = [models.Index(fields=["status"])]

    def __str__(self) -> str:
        return f"{self.dataset_id} {self.version}"


class DatasetCoverage(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    version = models.ForeignKey(DatasetVersion, on_delete=models.CASCADE, related_name="coverages")
    reference_frame = models.CharField(max_length=64, default=LUNAR_MEAN_EARTH)
    latitude_min = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    latitude_max = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    longitude_min = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)
    longitude_max = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)
    temporal_start = models.DateTimeField(null=True, blank=True)
    temporal_end = models.DateTimeField(null=True, blank=True)
    resolution = models.CharField(max_length=128, blank=True)
    units = models.CharField(max_length=64, blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=~Q(reference_frame__in=TERRESTRIAL_FRAMES),
                name="datasets_coverage_rejects_wgs84",
            ),
            models.CheckConstraint(
                condition=Q(latitude_min__isnull=True)
                | (Q(latitude_min__gte=-90) & Q(latitude_min__lte=90)),
                name="datasets_coverage_latitude_min",
            ),
            models.CheckConstraint(
                condition=Q(latitude_max__isnull=True)
                | (Q(latitude_max__gte=-90) & Q(latitude_max__lte=90)),
                name="datasets_coverage_latitude_max",
            ),
            models.CheckConstraint(
                condition=Q(longitude_min__isnull=True)
                | (Q(longitude_min__gte=-180) & Q(longitude_min__lte=180)),
                name="datasets_coverage_longitude_min",
            ),
            models.CheckConstraint(
                condition=Q(longitude_max__isnull=True)
                | (Q(longitude_max__gte=-180) & Q(longitude_max__lte=180)),
                name="datasets_coverage_longitude_max",
            ),
        ]


class DataIngestion(TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "pending", "En attente"
        RUNNING = "running", "En cours"
        SUCCEEDED = "succeeded", "Terminé"
        FAILED = "failed", "Échec"
        CANCELLED = "cancelled", "Annulé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source = models.ForeignKey(
        DataSource,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="ingestions",
    )
    dataset = models.ForeignKey(
        Dataset,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="ingestions",
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    logs = models.TextField(blank=True)
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="data_ingestions",
    )
    task_id = models.CharField(max_length=64, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["status", "created_at"])]
        ordering = ["-created_at"]


class SiteDataset(models.Model):
    site = models.ForeignKey(
        "catalog.LunarSite",
        on_delete=models.CASCADE,
        related_name="dataset_links",
    )
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name="site_links")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["site", "dataset"],
                name="datasets_unique_site_dataset",
            )
        ]
