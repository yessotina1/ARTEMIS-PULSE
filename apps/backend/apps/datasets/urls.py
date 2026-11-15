from rest_framework.routers import DefaultRouter

from apps.datasets.views import DataIngestionViewSet, DataSourceViewSet, DatasetViewSet

router = DefaultRouter()
router.register("data-sources", DataSourceViewSet, basename="data-source")
router.register("datasets", DatasetViewSet, basename="dataset")
router.register("admin/data-ingestions", DataIngestionViewSet, basename="data-ingestion")

urlpatterns = router.urls
