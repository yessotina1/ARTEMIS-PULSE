from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from common.health import health_payload


class HealthSerializer(serializers.Serializer):
    status = serializers.CharField()
    database = serializers.CharField(required=False)
    redis = serializers.CharField(required=False)


@extend_schema(responses={200: HealthSerializer}, auth=[])
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_live(_request):
    """Process is up. No database and no Redis."""
    return Response({"status": "ok"})


@extend_schema(responses={200: HealthSerializer, 503: HealthSerializer}, auth=[])
@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health_ready(_request):
    payload = health_payload()
    status_code = 200 if payload["status"] == "ok" else 503
    return Response(payload, status=status_code)
