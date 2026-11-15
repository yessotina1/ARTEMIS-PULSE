from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.datasets.models import DataIngestion, DataSource, Dataset, DatasetCoverage
from apps.datasets.serializers import (
    DataIngestionSerializer,
    DataSourceSerializer,
    DatasetCoverageSerializer,
    DatasetSerializer,
    DatasetVersionSerializer,
    IngestionCreateSerializer,
)
from apps.datasets.services import execute_ingestion
from common.exceptions import Conflict
from common.permissions import IsAdminOrReadOnly, IsAdminRole


@extend_schema_view(
    list=extend_schema(tags=["datasets"]),
    retrieve=extend_schema(tags=["datasets"]),
)
class DataSourceViewSet(ReadOnlyModelViewSet):
    queryset = DataSource.objects.all()
    serializer_class = DataSourceSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_url_kwarg = "source_id"


@extend_schema_view(
    list=extend_schema(tags=["datasets"]),
    retrieve=extend_schema(tags=["datasets"]),
)
class DatasetViewSet(ReadOnlyModelViewSet):
    serializer_class = DatasetSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_url_kwarg = "dataset_id"

    def get_queryset(self):
        queryset = Dataset.objects.select_related("source").order_by("name")
        source = self.request.query_params.get("source")
        if source:
            queryset = queryset.filter(source__code=source)
        product = self.request.query_params.get("product_code")
        if product:
            queryset = queryset.filter(product_code=product)
        availability = self.request.query_params.get("availability")
        if availability:
            queryset = queryset.filter(versions__status=availability).distinct()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset

    @extend_schema(tags=["datasets"])
    @action(detail=True, methods=["get"])
    def versions(self, request, dataset_id=None):
        queryset = self.get_object().versions.order_by("-retrieved_at", "version")
        page = self.paginate_queryset(queryset)
        serializer = DatasetVersionSerializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)

    @extend_schema(tags=["datasets"])
    @action(detail=True, methods=["get"])
    def coverage(self, request, dataset_id=None):
        queryset = DatasetCoverage.objects.filter(version__dataset=self.get_object())
        page = self.paginate_queryset(queryset)
        serializer = DatasetCoverageSerializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


@extend_schema_view(
    list=extend_schema(tags=["datasets"]),
    retrieve=extend_schema(tags=["datasets"]),
    create=extend_schema(tags=["datasets"]),
)
class DataIngestionViewSet(ModelViewSet):
    queryset = DataIngestion.objects.select_related("source", "dataset", "requested_by")
    serializer_class = DataIngestionSerializer
    permission_classes = [IsAdminRole]
    lookup_url_kwarg = "ingestion_id"
    http_method_names = ["get", "post", "head", "options"]

    def create(self, request, *args, **kwargs):
        body = IngestionCreateSerializer(data=request.data)
        body.is_valid(raise_exception=True)
        ingestion = DataIngestion.objects.create(
            source=body.validated_data["source"],
            requested_by=request.user,
            status=DataIngestion.Status.PENDING,
        )
        ingestion.task_id = str(ingestion.id)
        ingestion.save(update_fields=["task_id"])
        execute_ingestion(ingestion)
        ingestion.refresh_from_db()
        return Response(DataIngestionSerializer(ingestion).data, status=status.HTTP_202_ACCEPTED)

    @extend_schema(tags=["datasets"])
    @action(detail=True, methods=["post"])
    def retry(self, request, ingestion_id=None):
        ingestion = self.get_object()
        if ingestion.status not in {DataIngestion.Status.FAILED, DataIngestion.Status.CANCELLED}:
            raise Conflict("Seuls un import en échec ou annulé peut être relancé.")
        ingestion.status = DataIngestion.Status.PENDING
        ingestion.logs = ""
        ingestion.finished_at = None
        ingestion.task_id = str(ingestion.id)
        ingestion.save()
        execute_ingestion(ingestion)
        ingestion.refresh_from_db()
        return Response(DataIngestionSerializer(ingestion).data, status=status.HTTP_202_ACCEPTED)

    @extend_schema(tags=["datasets"])
    @action(detail=True, methods=["post"])
    def cancel(self, request, ingestion_id=None):
        ingestion = self.get_object()
        if ingestion.status not in {DataIngestion.Status.PENDING, DataIngestion.Status.RUNNING}:
            raise Conflict("Cet import n'est plus annulable.")
        ingestion.status = DataIngestion.Status.CANCELLED
        ingestion.finished_at = timezone.now()
        ingestion.logs = (ingestion.logs + "\n" if ingestion.logs else "") + "Annulé."
        ingestion.save()
        return Response(DataIngestionSerializer(ingestion).data)
