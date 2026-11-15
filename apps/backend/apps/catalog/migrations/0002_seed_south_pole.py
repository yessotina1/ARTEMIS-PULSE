from django.db import migrations

from apps.catalog.seed import seed_south_pole


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_south_pole, migrations.RunPython.noop),
    ]
