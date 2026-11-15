from django.contrib import admin
from django.urls import include, path
from drf_spectacular.utils import extend_schema
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from common.health import health_payload


@extend_schema(responses={200: dict, 503: dict})
@api_view(["GET"])
@permission_classes([AllowAny])
def health(_request):
    payload = health_payload()
    status_code = 200 if payload["status"] == "ok" else 503
    return Response(payload, status=status_code)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health, name="health"),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema"), name="docs"),
    path("api/v1/", include("api.urls")),
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/datasets/", include("apps.datasets.urls")),
]

admin.site.site_header = "ARTEMIS PULSE"
admin.site.site_title = "ARTEMIS PULSE"
