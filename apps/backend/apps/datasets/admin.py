from django.contrib import admin

from apps.datasets.models import Dataset


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "version", "provider")
    list_filter = ("product", "provider")
    search_fields = ("name", "version", "citation")
