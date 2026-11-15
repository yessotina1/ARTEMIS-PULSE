from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, TestCase
from rest_framework.test import APIClient

from common.db.neon import database_from_url


class NeonConfigTests(SimpleTestCase):
    def test_pooled_url_forces_ssl_and_transaction_pooling_options(self):
        config = database_from_url(
            "postgresql://user:secret@ep-example-pooler.eu-central-1.aws.neon.tech/artemis?sslmode=require"
        )
        self.assertEqual(config["ENGINE"], "common.db.backends.neon")
        self.assertEqual(config["CONN_MAX_AGE"], 0)
        self.assertTrue(config["DISABLE_SERVER_SIDE_CURSORS"])
        self.assertEqual(config["OPTIONS"]["sslmode"], "require")
        self.assertTrue(config["CONN_HEALTH_CHECKS"])

    def test_ssl_disable_is_rejected(self):
        with self.assertRaises(ImproperlyConfigured):
            database_from_url("postgresql://user:secret@ep-example.neon.tech/artemis?sslmode=disable")


class OpenApiTests(TestCase):
    def test_schema_lists_account_catalog_and_dataset_paths(self):
        response = APIClient().get("/api/schema/?format=json")
        self.assertEqual(response.status_code, 200)
        paths = response.json()["paths"]
        self.assertIn("/api/accounts/register/", paths)
        self.assertIn("/api/catalog/sites/", paths)
        self.assertIn("/api/datasets/records/", paths)
