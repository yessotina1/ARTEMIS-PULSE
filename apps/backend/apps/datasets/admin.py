from django.contrib import admin

from apps.datasets.models import Dataset


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "version", "source_name", "provider", "version_date")
    list_filter = ("product", "provider")
    search_fields = ("name", "version", "source_name", "citation", "provenance")
