from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.viewsets import ModelViewSet

from apps.catalog.models import LunarSite
from apps.catalog.permissions import CatalogWritePermission
from apps.catalog.serializers import LunarSiteSerializer


@extend_schema_view(
    list=extend_schema(tags=["catalog"]),
    retrieve=extend_schema(tags=["catalog"]),
    create=extend_schema(tags=["catalog"]),
    update=extend_schema(tags=["catalog"]),
    partial_update=extend_schema(tags=["catalog"]),
    destroy=extend_schema(tags=["catalog"]),
)
class LunarSiteViewSet(ModelViewSet):
    serializer_class = LunarSiteSerializer
    permission_classes = [CatalogWritePermission]
    lookup_field = "slug"
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["name", "slug", "description", "reference_frame"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        queryset = LunarSite.objects.all()
        frame = self.request.query_params.get("reference_frame")
        if frame:
            queryset = queryset.filter(reference_frame=frame)
        query = self.request.query_params.get("q")
        if query:
            queryset = queryset.filter(Q(name__icontains=query) | Q(description__icontains=query))
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
