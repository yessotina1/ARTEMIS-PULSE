from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.viewsets import ModelViewSet

from apps.datasets.models import Dataset
from apps.datasets.serializers import DatasetSerializer


class DatasetViewSet(ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
