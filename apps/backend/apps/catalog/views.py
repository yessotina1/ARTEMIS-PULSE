from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.catalog.models import LunarRegion, LunarSite
from apps.catalog.serializers import LunarRegionSerializer, LunarSiteSerializer
from common.permissions import IsAdminOrReadOnly


def _decimal(value):
    if value is None:
        return None
    return float(value)


@extend_schema_view(
    list=extend_schema(tags=["catalog"]),
    retrieve=extend_schema(tags=["catalog"]),
)
class LunarRegionViewSet(ReadOnlyModelViewSet):
    queryset = LunarRegion.objects.all().order_by("name")
    serializer_class = LunarRegionSerializer
    permission_classes = [AllowAny]
    lookup_url_kwarg = "region_id"

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(slug__icontains=search))
        return queryset


@extend_schema_view(
    list=extend_schema(tags=["catalog"]),
    retrieve=extend_schema(tags=["catalog"]),
    create=extend_schema(tags=["catalog"]),
    partial_update=extend_schema(tags=["catalog"]),
    destroy=extend_schema(tags=["catalog"]),
)
class LunarSiteViewSet(ModelViewSet):
    serializer_class = LunarSiteSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_url_kwarg = "site_id"
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        queryset = LunarSite.objects.select_related("region").order_by("name")
        user = self.request.user
        is_admin = bool(user and user.is_authenticated and getattr(user, "role", None) == "admin")
        if not is_admin:
            queryset = queryset.filter(status=LunarSite.Status.PUBLISHED)
        region = self.request.query_params.get("region")
        if region:
            queryset = queryset.filter(region_id=region)
        site_type = self.request.query_params.get("site_type")
        if site_type:
            queryset = queryset.filter(site_type=site_type)
        slug = self.request.query_params.get("slug")
        if slug:
            queryset = queryset.filter(slug=slug)
        if is_admin and self.request.query_params.get("status"):
            queryset = queryset.filter(status=self.request.query_params["status"])
        for name, lookup in (
            ("lat_min", "latitude_deg__gte"),
            ("lat_max", "latitude_deg__lte"),
            ("lon_min", "longitude_deg__gte"),
            ("lon_max", "longitude_deg__lte"),
        ):
            raw = self.request.query_params.get(name)
            if raw not in (None, ""):
                queryset = queryset.filter(**{lookup: raw})
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(slug__icontains=search) | Q(description__icontains=search)
            )
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def destroy(self, request, *args, **kwargs):
        site = self.get_object()
        site.status = LunarSite.Status.ARCHIVED
        site.save(update_fields=["status", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(tags=["catalog"])
    @action(detail=False, methods=["get"], url_path="geojson")
    def geojson(self, request):
        sites = [site for site in self.get_queryset() if site.latitude_deg is not None]
        frames = {site.reference_frame for site in sites}
        frame_name = next(iter(frames)) if len(frames) == 1 else "MIXED"
        features = [
            {
                "type": "Feature",
                "id": str(site.id),
                "geometry": {
                    "type": "Point",
                    "coordinates": [_decimal(site.longitude_deg), _decimal(site.latitude_deg)],
                },
                "properties": {
                    "name": site.name,
                    "slug": site.slug,
                    "site_type": site.site_type,
                    "reference_frame": site.reference_frame,
                    "elevation_m": _decimal(site.elevation_m),
                    "region_id": str(site.region_id) if site.region_id else None,
                },
            }
            for site in sites
        ]
        return Response(
            {
                "type": "FeatureCollection",
                "crs": {"type": "name", "properties": {"name": frame_name}},
                "features": features,
            }
        )

    @extend_schema(tags=["catalog"])
    @action(detail=True, methods=["get"], url_path="datasets")
    def datasets(self, request, site_id=None):
        from apps.datasets.models import SiteDataset
        from apps.datasets.serializers import DatasetSerializer

        links = SiteDataset.objects.filter(site=self.get_object()).select_related(
            "dataset",
            "dataset__source",
        )
        return Response(DatasetSerializer([link.dataset for link in links], many=True).data)
