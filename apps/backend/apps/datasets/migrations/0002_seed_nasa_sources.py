from django.db import migrations

from apps.datasets.seed import seed_nasa_datasets


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0002_seed_south_pole"),
        ("datasets", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_nasa_datasets, migrations.RunPython.noop),
    ]
