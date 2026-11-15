from django.utils.text import slugify
from rest_framework import serializers

from apps.catalog.models import LunarRegion, LunarSite
from common.frames import TERRESTRIAL_FRAMES


class LunarRegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = LunarRegion
        fields = (
            "id",
            "name",
            "slug",
            "description",
            "reference_frame",
            "latitude_min",
            "latitude_max",
            "longitude_min",
            "longitude_max",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_reference_frame(self, value: str) -> str:
        if value in TERRESTRIAL_FRAMES:
            raise serializers.ValidationError(
                "Un référentiel terrestre tel que WGS84 ne peut pas décrire une région lunaire."
            )
        return value


class LunarSiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = LunarSite
        fields = (
            "id",
            "region",
            "name",
            "slug",
            "site_type",
            "description",
            "latitude_deg",
            "longitude_deg",
            "reference_frame",
            "elevation_m",
            "characteristics",
            "citation",
            "notes",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def validate_reference_frame(self, value: str) -> str:
        if value in TERRESTRIAL_FRAMES:
            raise serializers.ValidationError(
                "Un référentiel terrestre tel que WGS84 ne peut pas décrire un site lunaire."
            )
        return value

    def validate_characteristics(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les caractéristiques doivent être un objet JSON.")
        return value

    def validate(self, attrs):
        latitude = attrs.get("latitude_deg", getattr(self.instance, "latitude_deg", None))
        longitude = attrs.get("longitude_deg", getattr(self.instance, "longitude_deg", None))
        frame = attrs.get("reference_frame", getattr(self.instance, "reference_frame", "unassigned"))
        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble, avec un référentiel."
            )
        if latitude is not None and frame in {"", "unassigned"}:
            raise serializers.ValidationError("Un site localisé doit indiquer un référentiel lunaire.")
        return attrs

    def create(self, validated_data):
        slug = (validated_data.get("slug") or "").strip()
        if not slug:
            base = slugify(validated_data["name"]) or "site"
            slug = base
            suffix = 2
            while LunarSite.objects.filter(slug=slug).exists():
                slug = f"{base}-{suffix}"
                suffix += 1
            validated_data["slug"] = slug
        return super().create(validated_data)
