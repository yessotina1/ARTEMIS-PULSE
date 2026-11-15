from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.catalog.models import LunarSite

PASSWORD = "Pulse-test-pass-1"


class ProductApiTests(APITestCase):
    def test_register_login_and_catalog_round_trip_without_invented_science(self):
        registered = self.client.post(
            "/api/v1/auth/register",
            {
                "email": "ada@example.com",
                "password": PASSWORD,
                "fullName": "Ada Lovelace",
                "profile": "PLANNER",
                "organization": "Observatoire",
            },
            format="json",
        )
        self.assertEqual(registered.status_code, 201)
        self.assertEqual(registered.data["user"]["profile"], "PLANNER")
        token = registered.data["token"]
        self.assertTrue(Token.objects.filter(key=token).exists())

        logged_out = self.client.post(
            "/api/v1/auth/logout",
            HTTP_AUTHORIZATION=f"Token {token}",
        )
        self.assertEqual(logged_out.status_code, 204)

        logged = self.client.post(
            "/api/v1/auth/login",
            {"email": "ada@example.com", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(logged.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {logged.data['token']}")

        site = LunarSite.objects.create(
            name="Shackleton",
            slug="shackleton",
            latitude_deg="-89.9",
            longitude_deg="0",
            elevation_m="100",
            description="Cratère du pôle Sud.",
            reference_frame="unassigned",
            characteristics={"category": "CRATER_RIM", "mission": "Artemis", "tags": ["psr"]},
            created_by=User.objects.get(email="ada@example.com"),
        )
        listed = self.client.get("/api/v1/sites?region=SOUTH_POLE")
        self.assertEqual(listed.status_code, 200)
        self.assertEqual(listed.data["meta"]["total"], 1)
        self.assertIsNone(listed.data["items"][0]["illuminationPercent"])
        self.assertEqual(listed.data["items"][0]["quality"], "UNCOMPUTABLE")

        detail = self.client.get(f"/api/v1/sites/{site.slug}")
        self.assertEqual(detail.status_code, 200)
        self.assertIsNone(detail.data["referenceState"]["sun"]["elevationDeg"])
        self.assertIsNone(detail.data["referenceState"]["solarFluxWm2"])
        self.assertEqual(detail.data["referenceState"]["sunVisibility"], "UNKNOWN")
        self.assertIsNone(detail.data["horizonProfile"])

        start = timezone.now().replace(microsecond=0)
        end = start + timezone.timedelta(hours=2)
        created = self.client.post(
            "/api/v1/scenarios",
            {
                "name": "Fenêtre test",
                "siteId": str(site.id),
                "observer": {"name": "Surface", "heightM": 2, "mode": "SITE_SURFACE"},
                "window": {
                    "startUtc": start.isoformat().replace("+00:00", "Z"),
                    "endUtc": end.isoformat().replace("+00:00", "Z"),
                    "stepSeconds": 3600,
                },
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201, created.data)
        self.assertEqual(created.data["window"]["steps"], 2)
        self.assertEqual(created.data["quality"], "UNCOMPUTABLE")

        run = self.client.post(f"/api/v1/scenarios/{created.data['id']}/runs", {}, format="json")
        self.assertEqual(run.status_code, 201)
        self.assertEqual(run.status_code and run.data["status"], "FAILED")
        self.assertIsNone(run.data["summary"])
        self.assertEqual(run.data["error"]["code"], "NOT_COMPUTED")
        self.assertNotIn("sunVisibleSeconds", str(run.data["summary"]))

        series = self.client.get(f"/api/v1/runs/{run.data['id']}/series")
        self.assertEqual(series.data["points"], [])
        windows = self.client.get(f"/api/v1/runs/{run.data['id']}/visibility-windows")
        self.assertEqual(windows.data["items"], [])
        comparison = self.client.post(
            "/api/v1/comparisons",
            {"scenarioIds": [created.data["id"]]},
            format="json",
        )
        self.assertEqual(comparison.status_code, 409)
        self.assertEqual(comparison.data["code"], "NOT_COMPUTED")
