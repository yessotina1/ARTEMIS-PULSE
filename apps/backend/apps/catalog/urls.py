from rest_framework.routers import DefaultRouter

from apps.catalog.views import LunarSiteViewSet

router = DefaultRouter()
router.register("sites", LunarSiteViewSet, basename="lunar-site")

urlpatterns = router.urls
