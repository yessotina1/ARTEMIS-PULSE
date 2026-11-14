from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.viewsets import ModelViewSet

from apps.catalog.models import LunarSite
from apps.catalog.serializers import LunarSiteSerializer


class LunarSiteViewSet(ModelViewSet):
    queryset = LunarSite.objects.all()
    serializer_class = LunarSiteSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
