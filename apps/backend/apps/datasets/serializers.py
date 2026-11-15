from rest_framework import serializers

from apps.datasets.models import DataIngestion, DataSource, Dataset, DatasetCoverage, DatasetVersion
from common.frames import TERRESTRIAL_FRAMES


class DataSourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataSource
        fields = (
            "id",
            "code",
            "name",
            "provider",
            "homepage_url",
            "api_base_url",
            "terms",
            "documentation_url",
            "connection_spec",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class DatasetVersionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetVersion
        fields = (
            "id",
            "dataset",
            "version",
            "retrieved_at",
            "status",
            "citation",
            "uncertainty_notes",
            "metadata",
            "storage_uri",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")


class DatasetCoverageSerializer(serializers.ModelSerializer):
    class Meta:
        model = DatasetCoverage
        fields = (
            "id",
            "version",
            "reference_frame",
            "latitude_min",
            "latitude_max",
            "longitude_min",
            "longitude_max",
            "temporal_start",
            "temporal_end",
            "resolution",
            "units",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "created_at", "updated_at")

    def validate_reference_frame(self, value: str) -> str:
        if value in TERRESTRIAL_FRAMES:
            raise serializers.ValidationError(
                "Un référentiel terrestre tel que WGS84 ne peut pas décrire une couverture lunaire."
            )
        return value


class DatasetSerializer(serializers.ModelSerializer):
    source_code = serializers.CharField(source="source.code", read_only=True)

    class Meta:
        model = Dataset
        fields = (
            "id",
            "source",
            "source_code",
            "name",
            "product_code",
            "description",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "source_code", "created_at", "updated_at")


class DataIngestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataIngestion
        fields = (
            "id",
            "source",
            "dataset",
            "status",
            "logs",
            "requested_by",
            "task_id",
            "started_at",
            "finished_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = fields


class IngestionCreateSerializer(serializers.Serializer):
    source_code = serializers.ChoiceField(choices=DataSource.Code.choices)

    def validate(self, attrs):
        try:
            attrs["source"] = DataSource.objects.get(code=attrs["source_code"])
        except DataSource.DoesNotExist as exc:
            raise serializers.ValidationError({"source_code": "Source inconnue."}) from exc
        return attrs
