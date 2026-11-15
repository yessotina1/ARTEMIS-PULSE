from django.core import mail
from django.test import TestCase
from rest_framework.test import APIClient

from apps.accounts.models import User

PASSWORD = "Pulse-test-pass-1"


class AccountApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_register_login_logout_and_profile(self):
        created = self.client.post(
            "/api/accounts/register/",
            {
                "username": "ada",
                "email": "ada@example.com",
                "password": PASSWORD,
                "first_name": "Ada",
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.data["role"], User.Role.PUBLIC)
        self.assertTrue(User.objects.get(username="ada").profile)

        denied = self.client.get("/api/accounts/me/")
        self.assertEqual(denied.status_code, 401)

        logged = self.client.post(
            "/api/accounts/login/",
            {"username": "ada@example.com", "password": PASSWORD},
            format="json",
        )
        self.assertEqual(logged.status_code, 200)
        self.assertEqual(logged.data["username"], "ada")

        updated = self.client.patch(
            "/api/accounts/me/",
            {"profile": {"affiliation": "Observatoire"}, "role": "mission_planner"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["profile"]["affiliation"], "Observatoire")
        self.assertEqual(updated.data["role"], User.Role.PUBLIC)

        logged_out = self.client.post("/api/accounts/logout/")
        self.assertEqual(logged_out.status_code, 204)
        self.assertEqual(self.client.get("/api/accounts/me/").status_code, 401)

    def test_password_reset_round_trip(self):
        user = User.objects.create_user(
            username="grace",
            email="grace@example.com",
            password=PASSWORD,
        )
        requested = self.client.post(
            "/api/accounts/password-reset/",
            {"email": "grace@example.com"},
            format="json",
        )
        self.assertEqual(requested.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)
        body = mail.outbox[0].body
        uid = body.split("uid : ", 1)[1].splitlines()[0].strip()
        token = body.split("token : ", 1)[1].splitlines()[0].strip()

        unknown = self.client.post(
            "/api/accounts/password-reset/",
            {"email": "absent@example.com"},
            format="json",
        )
        self.assertEqual(unknown.status_code, 200)
        self.assertEqual(len(mail.outbox), 1)

        confirmed = self.client.post(
            "/api/accounts/password-reset/confirm/",
            {"uid": uid, "token": token, "password": "Pulse-test-pass-2"},
            format="json",
        )
        self.assertEqual(confirmed.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("Pulse-test-pass-2"))

    def test_staff_assigns_mission_planner_role(self):
        staff = User.objects.create_user(
            username="staff",
            email="staff@example.com",
            password=PASSWORD,
            is_staff=True,
        )
        member = User.objects.create_user(
            username="educator",
            email="educator@example.com",
            password=PASSWORD,
            role=User.Role.EDUCATOR,
        )
        self.client.force_authenticate(staff)
        forbidden = APIClient()
        forbidden.force_authenticate(member)
        self.assertEqual(forbidden.get("/api/accounts/users/").status_code, 403)

        changed = self.client.patch(
            f"/api/accounts/users/{member.id}/",
            {"role": User.Role.MISSION_PLANNER},
            format="json",
        )
        self.assertEqual(changed.status_code, 200)
        member.refresh_from_db()
        self.assertEqual(member.role, User.Role.MISSION_PLANNER)
