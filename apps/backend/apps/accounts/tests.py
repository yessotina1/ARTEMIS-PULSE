from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User
from common.models import AuditEvent

PASSWORD = "Pulse-Lunar-2026"


def token_from_mail() -> str:
    body = mail.outbox[-1].body
    return body.split("Jeton : ", 1)[1].strip()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def _register(self, username="planner", email="planner@example.com"):
        return self.client.post(
            "/api/v1/auth/register/",
            {"username": username, "email": email, "password": PASSWORD, "first_name": "Ada"},
            format="json",
        )

    def _verify(self):
        return self.client.post(
            "/api/v1/auth/verify-email/",
            {"token": token_from_mail()},
            format="json",
        )

    def _login(self, username="planner"):
        return self.client.post(
            "/api/v1/auth/login/",
            {"username": username, "password": PASSWORD},
            format="json",
        )

    def test_register_rejects_privileged_role(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "username": "evil",
                "email": "evil@example.com",
                "password": PASSWORD,
                "role": "admin",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data["error"]["code"], "VALIDATION_ERROR")
        self.assertTrue(response.data["error"]["request_id"])
        self.assertFalse(User.objects.filter(username="evil").exists())

    def test_login_requires_verified_email_then_returns_tokens(self):
        self.assertEqual(self._register().status_code, 201)
        denied = self._login()
        self.assertEqual(denied.status_code, 403)
        self.assertEqual(denied.data["error"]["code"], "EMAIL_NOT_VERIFIED")
        self.assertEqual(self._verify().status_code, 200)
        logged = self._login()
        self.assertEqual(logged.status_code, 200)
        self.assertIn("access", logged.data)
        self.assertEqual(logged.data["user"]["role"], "public")

    def test_logout_revokes_refresh(self):
        self._register()
        self._verify()
        logged = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {logged.data['access']}")
        goodbye = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": logged.data["refresh"]},
            format="json",
        )
        self.assertEqual(goodbye.status_code, 204)
        self.client.credentials()
        refreshed = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": logged.data["refresh"]},
            format="json",
        )
        self.assertEqual(refreshed.status_code, 401)

    def test_password_reset_does_not_reveal_unknown_accounts(self):
        self._register()
        self._verify()
        known = self.client.post(
            "/api/v1/auth/password/forgot/",
            {"email": "planner@example.com"},
            format="json",
        )
        unknown = self.client.post(
            "/api/v1/auth/password/forgot/",
            {"email": "absent@example.com"},
            format="json",
        )
        self.assertEqual(known.status_code, 202)
        self.assertEqual(unknown.status_code, 202)
        self.assertEqual(known.data, unknown.data)
        reset = self.client.post(
            "/api/v1/auth/password/reset/",
            {"token": token_from_mail(), "password": "Pulse-Lunar-Reset-2026"},
            format="json",
        )
        self.assertEqual(reset.status_code, 200)
        logged = self.client.post(
            "/api/v1/auth/login/",
            {"username": "planner", "password": "Pulse-Lunar-Reset-2026"},
            format="json",
        )
        self.assertEqual(logged.status_code, 200)

    def test_me_and_notification_preferences(self):
        self._register()
        self._verify()
        logged = self._login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {logged.data['access']}")
        me = self.client.patch(
            "/api/v1/auth/me/",
            {"first_name": "Ada", "profile": {"language": "en", "affiliation": "ESA"}},
            format="json",
        )
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.data["profile"]["language"], "en")
        self.assertEqual(me.data["role"], "public")
        prefs = self.client.patch(
            "/api/v1/preferences/notifications/",
            {"email_enabled": False},
            format="json",
        )
        self.assertEqual(prefs.status_code, 200)
        self.assertFalse(prefs.data["email_enabled"])

    def test_admin_changes_role_and_is_audited(self):
        self._register()
        self._verify()
        admin = User.objects.create_user(
            username="root",
            email="root@example.com",
            password=PASSWORD,
            role=User.Role.ADMIN,
            is_email_verified=True,
        )
        logged = self.client.post(
            "/api/v1/auth/login/",
            {"username": "root", "password": PASSWORD},
            format="json",
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {logged.data['access']}")
        self.assertEqual(self.client.get("/api/v1/users/").status_code, 200)
        target = User.objects.get(username="planner")
        updated = self.client.patch(
            f"/api/v1/users/{target.id}/",
            {"role": "mission_planner"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        target.refresh_from_db()
        self.assertEqual(target.role, "mission_planner")
        self.assertTrue(AuditEvent.objects.filter(action="role_changed", resource_id=str(target.id)).exists())
        self.client.credentials()
        self.assertEqual(self.client.get("/api/v1/users/").status_code, 401)
        self.assertTrue(admin.is_staff)
