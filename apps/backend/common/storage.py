"""S3-compatible storage for DEM, imagery, and exports.

The client is created only when a transfer is requested. Missing credentials
are reported as an error; files are never written to a fake location.
"""

from __future__ import annotations

from django.conf import settings

from common.exceptions import StorageNotConfigured


def _client():
    endpoint = settings.AWS_S3_ENDPOINT_URL
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    access_key = settings.AWS_ACCESS_KEY_ID
    secret_key = settings.AWS_SECRET_ACCESS_KEY
    if not all([endpoint, bucket, access_key, secret_key]):
        raise StorageNotConfigured(
            "Object storage is not configured. Set AWS_S3_ENDPOINT_URL, "
            "AWS_STORAGE_BUCKET_NAME, AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
        )
    import boto3

    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name=settings.AWS_S3_REGION_NAME or "auto",
    ), bucket


def upload_bytes(*, key: str, payload: bytes, content_type: str) -> str:
    client, bucket = _client()
    client.put_object(Bucket=bucket, Key=key, Body=payload, ContentType=content_type)
    return key
