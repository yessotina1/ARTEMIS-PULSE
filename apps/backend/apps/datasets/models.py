import uuid

from django.db import models

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
    source_uri = models.URLField(max_length=500, blank=True)
    citation = models.TextField(blank=True)
    uncertainty_notes = models.TextField(blank=True)
    retrieved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["product", "version", "name"],
                name="datasets_unique_product_version_name",
            )
        ]
        indexes = [
            models.Index(fields=["product", "version"]),
        ]

    def __str__(self) -> str:
        return f"{self.name} ({self.version})"
