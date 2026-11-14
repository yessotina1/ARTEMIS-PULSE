import uuid

from django.conf import settings
from django.db import models

from common.models import TimeStampedModel


class ProcessingStatus(models.TextChoices):
    DRAFT = "draft", "Brouillon"
    QUEUED = "queued", "En file"
    RUNNING = "running", "En cours"
    SUCCEEDED = "succeeded", "Terminé"
    FAILED = "failed", "Échec"
    CANCELLED = "cancelled", "Annulé"


class AnalysisScenario(TimeStampedModel):
    """Inputs of an analysis. Parameters are requests, not computed results."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="analysis_scenarios",
    )
    site = models.ForeignKey(
        "catalog.LunarSite",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="scenarios",
    )
    parameters = models.JSONField(default=dict, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=["owner", "created_at"])]

    def __str__(self) -> str:
        return self.title


class AnalysisJob(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scenario = models.ForeignKey(
        AnalysisScenario,
        on_delete=models.CASCADE,
        related_name="jobs",
    )
    requested_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="analysis_jobs",
    )
    status = models.CharField(
        max_length=16,
        choices=ProcessingStatus.choices,
        default=ProcessingStatus.DRAFT,
    )
    celery_task_id = models.CharField(max_length=255, blank=True, db_index=True)
    progress = models.PositiveSmallIntegerField(default=0)
    error_message = models.TextField(blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["celery_task_id"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(progress__gte=0) & models.Q(progress__lte=100),
                name="analyses_progress_percent",
            )
        ]

    def __str__(self) -> str:
        return f"{self.scenario_id} [{self.status}]"
