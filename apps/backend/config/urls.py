from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from common.health import health_payload


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
    path("api/accounts/", include("apps.accounts.urls")),
    path("api/catalog/", include("apps.catalog.urls")),
    path("api/datasets/", include("apps.datasets.urls")),
    path("api/analyses/", include("apps.analyses.urls")),
    path("api/comparisons/", include("apps.comparisons.urls")),
    path("api/education/", include("apps.education.urls")),
    path("api/simulator/", include("apps.simulator.urls")),
    path("api/reports/", include("apps.reports.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/audit/", include("apps.audit.urls")),
]

admin.site.site_header = "ARTEMIS PULSE"
admin.site.site_title = "ARTEMIS PULSE"
