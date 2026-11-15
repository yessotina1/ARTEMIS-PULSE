from rest_framework.routers import DefaultRouter

from apps.catalog.views import LunarRegionViewSet, LunarSiteViewSet

router = DefaultRouter()
router.register("regions", LunarRegionViewSet, basename="region")
router.register("sites", LunarSiteViewSet, basename="site")

urlpatterns = router.urls
