from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from apps.catalog.models import LunarSite

PASSWORD = "Pulse-Lunar-2026"


class CatalogApiTests(TestCase):
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
        self.assertEqual(logged.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {logged.data['access']}")

    def test_public_lists_seeded_south_pole_sites(self):
        response = self.client.get("/api/v1/sites/?search=Shackleton")
        self.assertEqual(response.status_code, 200)
        names = [item["name"] for item in response.data["results"]]
        self.assertIn("Shackleton", names)
        shackleton = next(item for item in response.data["results"] if item["name"] == "Shackleton")
        self.assertEqual(shackleton["reference_frame"], "MOON_ME")
        self.assertIn("planetarynames.wr.usgs.gov", shackleton["citation"])

    def test_public_cannot_create_and_wgs84_is_rejected(self):
        denied = self.client.post("/api/v1/sites/", {"name": "Inventé", "slug": "invente"}, format="json")
        self.assertIn(denied.status_code, (401, 403))
        self._admin()
        rejected = self.client.post(
            "/api/v1/sites/",
            {
                "name": "Mauvais cadre",
                "slug": "mauvais-cadre",
                "latitude_deg": "-89.0",
                "longitude_deg": "0.0",
                "reference_frame": "WGS84",
            },
            format="json",
        )
        self.assertEqual(rejected.status_code, 400)
        self.assertEqual(rejected.data["error"]["code"], "VALIDATION_ERROR")
        self.assertFalse(LunarSite.objects.filter(slug="mauvais-cadre").exists())

    def test_delete_archives_instead_of_removing_the_row(self):
        self._admin()
        site = LunarSite.objects.get(slug="haworth")
        deleted = self.client.delete(f"/api/v1/sites/{site.id}/")
        self.assertEqual(deleted.status_code, 204)
        site.refresh_from_db()
        self.assertEqual(site.status, LunarSite.Status.ARCHIVED)
        self.client.credentials()
        hidden = self.client.get(f"/api/v1/sites/{site.id}/")
        self.assertEqual(hidden.status_code, 404)

    def test_geojson_names_the_lunar_frame(self):
        response = self.client.get("/api/v1/sites/geojson/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["crs"]["properties"]["name"], "MOON_ME")
        self.assertGreaterEqual(len(response.data["features"]), 5)
        rendered = str(response.data)
        self.assertNotIn("EPSG:4326", rendered)
        self.assertNotIn("WGS84", rendered)
