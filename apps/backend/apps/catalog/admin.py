from django.contrib import admin

from apps.catalog.models import LunarRegion, LunarSite


@admin.register(LunarRegion)
class LunarRegionAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "reference_frame")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(LunarSite)
class LunarSiteAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "status", "reference_frame", "latitude_deg", "longitude_deg")
    list_filter = ("status", "site_type", "reference_frame")
    search_fields = ("name", "slug", "citation")
    prepopulated_fields = {"slug": ("name",)}
