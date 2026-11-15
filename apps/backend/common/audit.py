from common.models import AuditEvent


def record_audit(
    *,
    actor,
    action: str,
    resource_type: str,
    resource_id: str = "",
    result: str = "succeeded",
    metadata: dict | None = None,
) -> AuditEvent:
    user = actor if getattr(actor, "is_authenticated", False) else None
    return AuditEvent.objects.create(
        actor=user,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id),
        result=result,
        metadata=metadata or {},
    )
