from django.contrib import admin

from apps.catalog.models import LunarSite


@admin.register(LunarSite)
class LunarSiteAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "reference_frame", "latitude_deg", "longitude_deg")
    search_fields = ("name", "slug", "description")
    prepopulated_fields = {"slug": ("name",)}
