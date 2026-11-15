from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.viewsets import ModelViewSet

from apps.datasets.models import Dataset
from apps.datasets.permissions import DatasetWritePermission
from apps.datasets.serializers import DatasetSerializer


@extend_schema_view(
    list=extend_schema(tags=["datasets"]),
    retrieve=extend_schema(tags=["datasets"]),
    create=extend_schema(tags=["datasets"]),
    update=extend_schema(tags=["datasets"]),
    partial_update=extend_schema(tags=["datasets"]),
    destroy=extend_schema(tags=["datasets"]),
)
class DatasetViewSet(ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [DatasetWritePermission]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "version", "source_name", "provider", "provenance", "product"]
    ordering_fields = ["name", "version", "version_date", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = super().get_queryset()
        product = self.request.query_params.get("product")
        version = self.request.query_params.get("version")
        if product:
            queryset = queryset.filter(product=product)
        if version:
            queryset = queryset.filter(version=version)
        return queryset
