from rest_framework import serializers

from apps.catalog.models import TERRESTRIAL_FRAMES, LunarSite


class LunarSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LunarSite
        fields = (
            "id",
            "name",
            "slug",
            "latitude_deg",
            "longitude_deg",
            "reference_frame",
            "elevation_m",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_reference_frame(self, value: str) -> str:
        if value in TERRESTRIAL_FRAMES:
            raise serializers.ValidationError(
                "A terrestrial frame such as WGS84 cannot label a lunar site."
            )
        return value

    def validate(self, attrs):
        latitude = attrs.get("latitude_deg", getattr(self.instance, "latitude_deg", None))
        longitude = attrs.get("longitude_deg", getattr(self.instance, "longitude_deg", None))
        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                "Latitude and longitude must be provided together, with a reference frame."
            )
        return attrs
