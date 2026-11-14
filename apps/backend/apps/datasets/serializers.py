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
            "source_uri",
            "citation",
            "uncertainty_notes",
            "retrieved_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")
