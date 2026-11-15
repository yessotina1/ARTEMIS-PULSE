from django.test import TestCase
from rest_framework.test import APIClient


class PlatformTests(TestCase):
    def test_live_and_ready(self):
        client = APIClient()
        live = client.get("/health/live/")
        ready = client.get("/health/ready/")
        self.assertEqual(live.status_code, 200)
        self.assertEqual(live.data["status"], "ok")
        self.assertEqual(ready.status_code, 200)
        self.assertEqual(ready.data["database"], "sqlite-test")

    def test_openapi_lists_auth_login(self):
        response = APIClient().get("/api/schema/")
        self.assertEqual(response.status_code, 200)
        self.assertIn("auth/login", response.content.decode())
