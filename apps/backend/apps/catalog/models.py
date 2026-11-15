import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q

from common.models import TimeStampedModel

TERRESTRIAL_FRAMES = ("4326", "EPSG:4326", "WGS84", "wgs84")


class LunarSite(TimeStampedModel):
    """A catalogued lunar location.

    Latitude and longitude are stored as plain decimals together with an
    explicit reference frame. They are not PostGIS geographies and they are
    not interpreted as WGS84.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    latitude_deg = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    longitude_deg = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)
    reference_frame = models.CharField(max_length=64, default="unassigned")
    elevation_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    characteristics = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="lunar_sites",
    )

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["reference_frame"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(latitude_deg__isnull=True)
                | (Q(latitude_deg__gte=-90) & Q(latitude_deg__lte=90)),
                name="catalog_latitude_range",
            ),
            models.CheckConstraint(
                condition=Q(longitude_deg__isnull=True)
                | (Q(longitude_deg__gte=-180) & Q(longitude_deg__lte=180)),
                name="catalog_longitude_range",
            ),
            models.CheckConstraint(
                condition=~Q(reference_frame__in=TERRESTRIAL_FRAMES),
                name="catalog_rejects_wgs84",
            ),
            models.CheckConstraint(
                condition=(
                    Q(latitude_deg__isnull=True, longitude_deg__isnull=True)
                    | Q(latitude_deg__isnull=False, longitude_deg__isnull=False)
                ),
                name="catalog_coordinates_are_paired",
            ),
        ]

    def __str__(self) -> str:
        return self.name
