from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.datasets.models import DataIngestion, DataSource, DatasetVersion

PASSWORD = "Pulse-Lunar-2026"
FAKE_HORIZONS = {
    "version": "test-signature",
    "signature": {"version": "test-signature", "source": "JPL"},
    "result_excerpt": "Moon body data",
    "source_url": "https://ssd.jpl.nasa.gov/api/horizons.api",
}


class DatasetApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username="root",
            email="root@example.com",
            password=PASSWORD,
            role=User.Role.ADMIN,
            is_email_verified=True,
        )

    def _admin(self):
        logged = self.client.post(
            "/api/v1/auth/login/",
            {"username": "root", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {logged.data['access']}")

    def test_public_can_read_nasa_sources(self):
        response = self.client.get("/api/v1/data-sources/")
        self.assertEqual(response.status_code, 200)
        codes = {item["code"] for item in response.data["results"]}
        self.assertEqual(codes, {"horizons", "quickmap", "moon_trek"})

    @patch("apps.datasets.services.fetch_horizons_metadata", return_value=FAKE_HORIZONS)
    def test_horizons_ingestion_stores_signature_only(self, _fetch):
        self._admin()
        response = self.client.post(
            "/api/v1/admin/data-ingestions/",
            {"source_code": "horizons"},
            format="json",
        )
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.data["status"], "succeeded")
        version = DatasetVersion.objects.get(version="test-signature")
        self.assertEqual(version.metadata["signature"]["source"], "JPL")
        self.assertNotIn("vectors", version.metadata)
        self.assertIn("Aucun", version.dataset.ingestions.get().logs)

    def test_cancel_pending_ingestion(self):
        self._admin()
        ingestion = DataIngestion.objects.create(
            source=DataSource.objects.get(code="quickmap"),
            requested_by=self.admin,
            status=DataIngestion.Status.PENDING,
            task_id="pending-task",
        )
        response = self.client.post(f"/api/v1/admin/data-ingestions/{ingestion.id}/cancel/")
        self.assertEqual(response.status_code, 200)
        ingestion.refresh_from_db()
        self.assertEqual(ingestion.status, DataIngestion.Status.CANCELLED)
