from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User

PASSWORD = "Pulse-test-pass-1"


class DatasetApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.planner = User.objects.create_user(
            username="planner",
            email="planner@example.com",
            password=PASSWORD,
            role=User.Role.MISSION_PLANNER,
        )
        self.public = User.objects.create_user(
            username="visitor",
            email="visitor@example.com",
            password=PASSWORD,
            role=User.Role.PUBLIC,
        )

    def test_metadata_is_recorded_without_measurements(self):
        self.client.force_authenticate(self.public)
        self.assertEqual(
            self.client.post("/api/datasets/records/", {"name": "LOLA", "product": "lola", "version": "1"}, format="json").status_code,
            403,
        )

        self.client.force_authenticate(self.planner)
        created = self.client.post(
            "/api/datasets/records/",
            {
                "name": "LDEM",
                "product": "lola",
                "version": "unspecified",
                "source_name": "LOLA",
                "provenance": "Notice à compléter à partir de la fiche NASA du produit retenu.",
                "coverage_start": "2009-07-01",
                "coverage_end": "2009-06-01",
                "metadata": {"processing_level": "unknown"},
            },
            format="json",
        )
        self.assertEqual(created.status_code, 400)

        created = self.client.post(
            "/api/datasets/records/",
            {
                "name": "LDEM",
                "product": "lola",
                "version": "unspecified",
                "source_name": "LOLA",
                "provider": "NASA",
                "provenance": "Notice à compléter à partir de la fiche NASA du produit retenu.",
                "metadata": {"processing_level": "unknown"},
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertNotIn("elevation", created.data["metadata"])

        self.client.force_authenticate(None)
        listed = self.client.get("/api/datasets/records/?product=lola")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data["count"], 1)
