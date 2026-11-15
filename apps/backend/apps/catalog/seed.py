"""South-pole catalogue from the USGS Gazetteer of Planetary Nomenclature.

Coordinates are planetographic, longitude positive east, stored as MOON_ME.
They are not WGS84.
"""

from decimal import Decimal

SITES = [
    {
        "name": "Shackleton",
        "slug": "shackleton",
        "feature_id": 5450,
        "latitude_deg": Decimal("-89.67"),
        "longitude_deg": Decimal("129.78"),
        "url": "https://planetarynames.wr.usgs.gov/Feature/5450",
    },
    {
        "name": "Haworth",
        "slug": "haworth",
        "feature_id": 14502,
        "latitude_deg": Decimal("-86.90"),
        "longitude_deg": Decimal("-4.00"),
        "url": "https://planetarynames.wr.usgs.gov/Feature/14502",
    },
    {
        "name": "Nobile",
        "slug": "nobile",
        "feature_id": 4321,
        "latitude_deg": Decimal("-85.28"),
        "longitude_deg": Decimal("53.27"),
        "url": "https://planetarynames.wr.usgs.gov/Feature/4321",
    },
    {
        "name": "de Gerlache",
        "slug": "de-gerlache",
        "feature_id": 1439,
        "latitude_deg": Decimal("-88.48"),
        "longitude_deg": Decimal("-88.34"),
        "url": "https://planetarynames.wr.usgs.gov/Feature/1439",
    },
    {
        "name": "Malapert",
        "slug": "malapert",
        "feature_id": 3603,
        "latitude_deg": Decimal("-85.00"),
        "longitude_deg": Decimal("11.40"),
        "url": "https://planetarynames.wr.usgs.gov/Feature/3603",
    },
]


def seed_south_pole(apps, schema_editor):
    LunarRegion = apps.get_model("catalog", "LunarRegion")
    LunarSite = apps.get_model("catalog", "LunarSite")
    region, _created = LunarRegion.objects.get_or_create(
        slug="south-pole",
        defaults={
            "name": "Pôle sud",
            "description": (
                "Région du pôle sud lunaire. L'emprise et les sites sont exprimés "
                "dans le repère body-fixed Mean Earth (MOON_ME), longitude positive "
                "vers l'est, d'après le USGS Gazetteer of Planetary Nomenclature. "
                "Ce n'est pas WGS84."
            ),
            "reference_frame": "MOON_ME",
            "latitude_min": Decimal("-90"),
            "latitude_max": Decimal("-80"),
            "longitude_min": Decimal("-180"),
            "longitude_max": Decimal("180"),
        },
    )
    for item in SITES:
        citation = (
            f"USGS Gazetteer of Planetary Nomenclature, {item['name']} "
            f"(feature {item['feature_id']}), latitude planétographique, "
            f"longitude positive est. {item['url']}"
        )
        LunarSite.objects.get_or_create(
            slug=item["slug"],
            defaults={
                "region": region,
                "name": item["name"],
                "site_type": "crater",
                "description": f"Cratère {item['name']}, pôle sud lunaire.",
                "latitude_deg": item["latitude_deg"],
                "longitude_deg": item["longitude_deg"],
                "reference_frame": "MOON_ME",
                "characteristics": {
                    "terrain": "Cratère d'impact au pôle sud.",
                    "quickmap_url": "https://quickmap.lroc.asu.edu/",
                    "moon_trek_url": "https://trek.nasa.gov/moon/",
                },
                "citation": citation,
                "status": "published",
            },
        )
