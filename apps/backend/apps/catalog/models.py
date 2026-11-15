import uuid

from django.conf import settings
from django.db import models
from django.db.models import Q

from common.frames import LUNAR_MEAN_EARTH, TERRESTRIAL_FRAMES
from common.models import TimeStampedModel


class LunarRegion(TimeStampedModel):
    """Named lunar area. Bounds use an explicit lunar frame, never WGS84."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    reference_frame = models.CharField(max_length=64, default=LUNAR_MEAN_EARTH)
    latitude_min = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    latitude_max = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    longitude_min = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)
    longitude_max = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["slug"])]
        constraints = [
            models.CheckConstraint(
                condition=~Q(reference_frame__in=TERRESTRIAL_FRAMES),
                name="catalog_region_rejects_wgs84",
            ),
            models.CheckConstraint(
                condition=Q(latitude_min__isnull=True)
                | (Q(latitude_min__gte=-90) & Q(latitude_min__lte=90)),
                name="catalog_region_latitude_min_range",
            ),
            models.CheckConstraint(
                condition=Q(latitude_max__isnull=True)
                | (Q(latitude_max__gte=-90) & Q(latitude_max__lte=90)),
                name="catalog_region_latitude_max_range",
            ),
            models.CheckConstraint(
                condition=Q(longitude_min__isnull=True)
                | (Q(longitude_min__gte=-180) & Q(longitude_min__lte=180)),
                name="catalog_region_longitude_min_range",
            ),
            models.CheckConstraint(
                condition=Q(longitude_max__isnull=True)
                | (Q(longitude_max__gte=-180) & Q(longitude_max__lte=180)),
                name="catalog_region_longitude_max_range",
            ),
            models.CheckConstraint(
                condition=(
                    Q(
                        latitude_min__isnull=True,
                        latitude_max__isnull=True,
                        longitude_min__isnull=True,
                        longitude_max__isnull=True,
                    )
                    | Q(
                        latitude_min__isnull=False,
                        latitude_max__isnull=False,
                        longitude_min__isnull=False,
                        longitude_max__isnull=False,
                    )
                ),
                name="catalog_region_bounds_are_complete",
            ),
            models.CheckConstraint(
                condition=Q(latitude_min__isnull=True)
                | Q(latitude_max__isnull=True)
                | Q(latitude_min__lte=models.F("latitude_max")),
                name="catalog_region_latitude_order",
            ),
            models.CheckConstraint(
                condition=Q(longitude_min__isnull=True)
                | Q(longitude_max__isnull=True)
                | Q(longitude_min__lte=models.F("longitude_max")),
                name="catalog_region_longitude_order",
            ),
        ]

    def __str__(self) -> str:
        return self.name


class LunarSite(TimeStampedModel):
    """A catalogued lunar location.

    Latitude and longitude are plain decimals with an explicit reference frame.
    They are not PostGIS geographies and they are not WGS84.
    """

    class Status(models.TextChoices):
        PUBLISHED = "published", "Publié"
        ARCHIVED = "archived", "Archivé"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    region = models.ForeignKey(
        LunarRegion,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="sites",
    )
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    site_type = models.CharField(max_length=64, blank=True)
    description = models.TextField(blank=True)
    latitude_deg = models.DecimalField(max_digits=8, decimal_places=5, null=True, blank=True)
    longitude_deg = models.DecimalField(max_digits=9, decimal_places=5, null=True, blank=True)
    reference_frame = models.CharField(max_length=64, default="unassigned")
    elevation_m = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    characteristics = models.JSONField(default=dict, blank=True)
    citation = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PUBLISHED)
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
            models.Index(fields=["status"]),
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
            models.CheckConstraint(
                condition=~Q(latitude_deg__isnull=False, reference_frame="unassigned"),
                name="catalog_located_site_has_frame",
            ),
        ]

    def __str__(self) -> str:
        return self.name
