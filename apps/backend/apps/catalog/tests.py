from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User

PASSWORD = "Pulse-test-pass-1"


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.planner = User.objects.create_user(
            username="planner",
            email="planner@example.com",
            password=PASSWORD,
            role=User.Role.MISSION_PLANNER,
        )
        self.educator = User.objects.create_user(
            username="teacher",
            email="teacher@example.com",
            password=PASSWORD,
            role=User.Role.EDUCATOR,
        )

    def test_mission_planner_manages_sites_and_rejects_wgs84(self):
        anonymous = self.client.post(
            "/api/catalog/sites/",
            {"name": "Cratère Shackleton"},
            format="json",
        )
        self.assertEqual(anonymous.status_code, 401)

        self.client.force_authenticate(self.educator)
        self.assertEqual(
            self.client.post("/api/catalog/sites/", {"name": "Cratère Shackleton"}, format="json").status_code,
            403,
        )

        self.client.force_authenticate(self.planner)
        created = self.client.post(
            "/api/catalog/sites/",
            {
                "name": "Cratère Shackleton",
                "latitude_deg": "-89.9",
                "longitude_deg": "0.0",
                "reference_frame": "unassigned",
                "description": "Site candidat, référentiel non validé.",
                "characteristics": {"region": "south_pole"},
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["slug"], "cratere-shackleton")
        self.assertEqual(created.data["characteristics"]["region"], "south_pole")

        rejected = self.client.post(
            "/api/catalog/sites/",
            {"name": "Site terrestre", "reference_frame": "WGS84", "slug": "terrestre"},
            format="json",
        )
        self.assertEqual(rejected.status_code, 400)

        self.client.force_authenticate(None)
        listed = self.client.get("/api/catalog/sites/")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data["count"], 1)
