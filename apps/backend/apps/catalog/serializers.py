from django.utils.text import slugify
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
            "description",
            "characteristics",
            "notes",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def validate_reference_frame(self, value: str) -> str:
        if value in TERRESTRIAL_FRAMES:
            raise serializers.ValidationError(
                "Un référentiel terrestre tel que WGS84 ne peut pas désigner un site lunaire."
            )
        return value

    def validate_latitude_deg(self, value):
        if value is not None and not (-90 <= value <= 90):
            raise serializers.ValidationError("La latitude doit être comprise entre -90 et 90.")
        return value

    def validate_longitude_deg(self, value):
        if value is not None and not (-180 <= value <= 180):
            raise serializers.ValidationError("La longitude doit être comprise entre -180 et 180.")
        return value

    def validate_characteristics(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les caractéristiques doivent être un objet JSON.")
        return value

    def validate(self, attrs):
        latitude = attrs.get("latitude_deg", getattr(self.instance, "latitude_deg", None))
        longitude = attrs.get("longitude_deg", getattr(self.instance, "longitude_deg", None))
        if (latitude is None) ^ (longitude is None):
            raise serializers.ValidationError(
                "La latitude et la longitude doivent être fournies ensemble."
            )
        slug = attrs.get("slug") or getattr(self.instance, "slug", "")
        if not slug:
            name = attrs.get("name") or getattr(self.instance, "name", "")
            attrs["slug"] = slugify(name)
        elif "slug" in attrs:
            attrs["slug"] = slugify(attrs["slug"])
        candidate = attrs.get("slug", slug)
        if not candidate:
            raise serializers.ValidationError("Le nom ne permet pas de produire un identifiant.")
        taken = LunarSite.objects.filter(slug=candidate)
        if self.instance is not None:
            taken = taken.exclude(pk=self.instance.pk)
        if taken.exists():
            raise serializers.ValidationError({"slug": "Cet identifiant est déjà utilisé."})
        return attrs
