from django.contrib import admin

from apps.datasets.models import DataIngestion, DataSource, Dataset, DatasetCoverage, DatasetVersion


@admin.register(DataSource)
class DataSourceAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "provider")
    search_fields = ("name", "code", "provider")


@admin.register(Dataset)
class DatasetAdmin(admin.ModelAdmin):
    list_display = ("name", "product_code", "source")
    list_filter = ("product_code", "source")
    search_fields = ("name", "description")


@admin.register(DatasetVersion)
class DatasetVersionAdmin(admin.ModelAdmin):
    list_display = ("dataset", "version", "status", "retrieved_at")
    list_filter = ("status",)
    search_fields = ("version", "citation")


@admin.register(DatasetCoverage)
class DatasetCoverageAdmin(admin.ModelAdmin):
    list_display = ("version", "reference_frame", "resolution", "units")


@admin.register(DataIngestion)
class DataIngestionAdmin(admin.ModelAdmin):
    list_display = ("source", "status", "task_id", "created_at")
    list_filter = ("status",)
