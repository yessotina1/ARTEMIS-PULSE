from rest_framework import serializers

from apps.datasets.models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = (
            "id",
            "name",
            "product",
            "version",
            "provider",
            "source_name",
            "source_uri",
            "version_date",
            "coverage_start",
            "coverage_end",
            "provenance",
            "citation",
            "uncertainty_notes",
            "metadata",
            "retrieved_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_metadata(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Les métadonnées doivent être un objet JSON.")
        return value

    def validate(self, attrs):
        start = attrs.get("coverage_start", getattr(self.instance, "coverage_start", None))
        end = attrs.get("coverage_end", getattr(self.instance, "coverage_end", None))
        if start and end and end < start:
            raise serializers.ValidationError(
                "La fin de couverture ne peut pas précéder le début."
            )
        return attrs
