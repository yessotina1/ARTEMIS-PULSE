import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from common.models import TimeStampedModel


class User(AbstractUser):
    class Role(models.TextChoices):
        MISSION_PLANNER = "mission_planner", "Mission Planner"
        EDUCATOR = "educator", "Educator"
        PUBLIC = "public", "Public"

    email = models.EmailField("adresse électronique", unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.PUBLIC)

    class Meta:
        indexes = [models.Index(fields=["role"])]


class Profile(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    affiliation = models.CharField(max_length=255, blank=True)
    biography = models.TextField(blank=True)

    def __str__(self) -> str:
        return self.user.get_username()
