from django.contrib import admin

from common.models import AuditEvent


@admin.register(AuditEvent)
class AuditEventAdmin(admin.ModelAdmin):
    list_display = ("created_at", "action", "resource_type", "resource_id", "actor", "result")
    list_filter = ("action", "result")
    search_fields = ("action", "resource_type", "resource_id")
    readonly_fields = (
        "id",
        "actor",
        "action",
        "resource_type",
        "resource_id",
        "result",
        "metadata",
        "created_at",
    )
