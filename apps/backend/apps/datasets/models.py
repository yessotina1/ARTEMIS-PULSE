import uuid

from django.db import models
from django.db.models import F, Q

from common.models import TimeStampedModel


class Dataset(TimeStampedModel):
    """Provenance record for a scientific dataset. It stores no measurements."""

    class Product(models.TextChoices):
        HORIZONS = "horizons", "JPL Horizons"
        SPICE = "spice", "NAIF SPICE"
        LOLA = "lola", "LOLA"
        LROC = "lroc", "LROC"
        OTHER = "other", "Autre"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    product = models.CharField(max_length=32, choices=Product.choices)
    version = models.CharField(max_length=128)
    provider = models.CharField(max_length=128, default="NASA")
    source_name = models.CharField(max_length=255, blank=True)
    source_uri = models.URLField(max_length=500, blank=True)
    version_date = models.DateField(null=True, blank=True)
    coverage_start = models.DateField(null=True, blank=True)
    coverage_end = models.DateField(null=True, blank=True)
    provenance = models.TextField(blank=True)
    citation = models.TextField(blank=True)
    uncertainty_notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    retrieved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["product", "version"]),
            models.Index(fields=["source_name"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "version", "name"],
                name="datasets_unique_product_version_name",
            ),
            models.CheckConstraint(
                condition=Q(coverage_start__isnull=True)
                | Q(coverage_end__isnull=True)
                | Q(coverage_end__gte=F("coverage_start")),
                name="datasets_coverage_order",
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.version})"
