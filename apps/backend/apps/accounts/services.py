import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.text import slugify
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import AuthSession, OneTimeToken, User
from common.audit import record_audit
from common.exceptions import Conflict


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def issue_token(user: User, purpose: str, ttl: timedelta) -> str:
    raw = secrets.token_urlsafe(32)
    OneTimeToken.objects.create(
        user=user,
        purpose=purpose,
        token_hash=hash_token(raw),
        expires_at=timezone.now() + ttl,
    )
    return raw


def find_token(raw: str, purposes: list[str]) -> OneTimeToken | None:
    return (
        OneTimeToken.objects.select_related("user")
        .filter(
            token_hash=hash_token(raw),
            purpose__in=purposes,
            used_at__isnull=True,
            expires_at__gt=timezone.now(),
        )
        .first()
    )


def consume_token(token: OneTimeToken) -> None:
    token.used_at = timezone.now()
    token.save(update_fields=["used_at", "updated_at"])


def send_token_email(*, user: User, subject: str, raw: str) -> None:
    send_mail(
        subject=subject,
        message=f"Jeton : {raw}",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


def blacklist_jti(jti: str) -> None:
    outstanding = OutstandingToken.objects.filter(jti=jti).first()
    if outstanding is not None:
        BlacklistedToken.objects.get_or_create(token=outstanding)


def open_session(*, user: User, request) -> tuple[str, str]:
    refresh = RefreshToken.for_user(user)
    AuthSession.objects.create(
        user=user,
        refresh_jti=str(refresh["jti"]),
        user_agent=(request.META.get("HTTP_USER_AGENT") or "")[:512],
        ip_address=request.META.get("REMOTE_ADDR") or None,
    )
    return str(refresh.access_token), str(refresh)


def revoke_session(session: AuthSession) -> None:
    blacklist_jti(session.refresh_jti)
    if session.revoked_at is None:
        session.revoked_at = timezone.now()
        session.save(update_fields=["revoked_at", "updated_at"])


def revoke_all_sessions(user: User) -> None:
    for session in user.auth_sessions.filter(revoked_at__isnull=True):
        revoke_session(session)


def invite_user(*, email: str, role: str, invited_by: User) -> User:
    if User.objects.filter(email__iexact=email).exists():
        raise Conflict("Un compte existe déjà pour cette adresse.")
    local = slugify(email.split("@", 1)[0]) or "invite"
    username = local[:140]
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f"{local[:120]}-{suffix}"
    user = User(username=username, email=email, role=role, is_email_verified=False)
    user.set_unusable_password()
    user.save()
    raw = issue_token(user, OneTimeToken.Purpose.INVITATION, timedelta(days=7))
    send_token_email(user=user, subject="ARTEMIS PULSE — invitation", raw=raw)
    record_audit(
        actor=invited_by,
        action="user_invited",
        resource_type="user",
        resource_id=str(user.id),
        metadata={"role": role},
    )
    return user
