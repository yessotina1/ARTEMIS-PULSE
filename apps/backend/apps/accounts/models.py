import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from common.models import TimeStampedModel


def default_notification_preferences() -> dict:
    return {
        "email_enabled": True,
        "categories": {"analysis": True, "invitation": True, "report": True},
    }


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Administrateur"
        MISSION_PLANNER = "mission_planner", "Mission Planner"
        EDUCATOR = "educator", "Educator"
        PUBLIC = "public", "Public"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("adresse e-mail", unique=True)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.PUBLIC)
    is_email_verified = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["role"])]

    def save(self, *args, **kwargs):
        if self.role == self.Role.ADMIN:
            self.is_staff = True
        elif not self.is_superuser:
            self.is_staff = False
        super().save(*args, **kwargs)


class Profile(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    affiliation = models.CharField(max_length=255, blank=True)
    biography = models.TextField(blank=True)
    language = models.CharField(max_length=16, default="fr")
    preferences = models.JSONField(default=dict, blank=True)
    notification_preferences = models.JSONField(default=default_notification_preferences, blank=True)

    def __str__(self) -> str:
        return self.user.get_username()


class OneTimeToken(TimeStampedModel):
    class Purpose(models.TextChoices):
        EMAIL_VERIFY = "email_verification", "Vérification d'e-mail"
        PASSWORD_RESET = "password_reset", "Réinitialisation du mot de passe"
        INVITATION = "invitation", "Invitation"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="one_time_tokens")
    purpose = models.CharField(max_length=32, choices=Purpose.choices)
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["purpose", "expires_at"])]


class AuthSession(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="auth_sessions")
    refresh_jti = models.CharField(max_length=255, unique=True)
    user_agent = models.CharField(max_length=512, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [models.Index(fields=["user", "revoked_at"])]

    def __str__(self) -> str:
        return f"{self.user_id} {self.refresh_jti}"
