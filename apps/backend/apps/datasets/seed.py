"""Static provenance records for Horizons, Quickmap and Moon Trek.

These rows describe where the data come from. They do not copy rasters,
kernels or ephemeris tables into the database.
"""

from decimal import Decimal

GLOBAL_BOUNDS = {
    "reference_frame": "MOON_ME",
    "latitude_min": Decimal("-90"),
    "latitude_max": Decimal("90"),
    "longitude_min": Decimal("-180"),
    "longitude_max": Decimal("180"),
}

SOURCES = [
    {
        "code": "horizons",
        "name": "JPL Horizons",
        "provider": "NASA Jet Propulsion Laboratory",
        "homepage_url": "https://ssd.jpl.nasa.gov/horizons/",
        "api_base_url": "https://ssd.jpl.nasa.gov/api/horizons.api",
        "documentation_url": "https://ssd-api.jpl.nasa.gov/doc/horizons.html",
        "terms": (
            "API publique JPL Horizons, sans clé. Citer NASA/JPL. "
            "Ce socle n'enregistre que la signature de l'API, pas des vecteurs d'état."
        ),
        "connection_spec": {
            "format": "json",
            "COMMAND": "301",
            "OBJ_DATA": "YES",
            "MAKE_EPHEM": "NO",
        },
    },
    {
        "code": "quickmap",
        "name": "LROC QuickMap",
        "provider": "Arizona State University / NASA LROC",
        "homepage_url": "https://quickmap.lroc.asu.edu/",
        "api_base_url": "https://quickmap.lroc.asu.edu/",
        "documentation_url": "https://www.lroc.asu.edu/",
        "terms": (
            "Imagerie et topographie LROC/LOLA consultées dans QuickMap. "
            "Les fichiers ne sont pas proxifiés par cette API. "
            "Crédit : NASA/GSFC/Arizona State University."
        ),
        "connection_spec": {"access": "external-viewer", "download": False},
    },
    {
        "code": "moon_trek",
        "name": "NASA Moon Trek",
        "provider": "NASA",
        "homepage_url": "https://trek.nasa.gov/moon/",
        "api_base_url": "https://trek.nasa.gov/moon/",
        "documentation_url": "https://trek.nasa.gov/",
        "terms": (
            "Visualisation lunaire Moon Trek. Les tuiles restent chez NASA Trek "
            "et ne sont pas proxifiées par Django."
        ),
        "connection_spec": {"access": "external-viewer", "download": False},
    },
]

DATASETS = [
    {
        "source": "horizons",
        "product_code": "horizons_ephemeris",
        "name": "Horizons — Lune (301), métadonnées",
        "description": "Signature et texte d'objet Horizons pour le corps 301. Pas d'éphéméride stockée.",
        "version": "unversioned",
        "citation": "NASA JPL Horizons, https://ssd.jpl.nasa.gov/horizons/",
        "uncertainty_notes": "La version est remplacée par la signature renvoyée lors d'un import.",
        "resolution": "",
        "units": "",
        "coverage": False,
    },
    {
        "source": "quickmap",
        "product_code": "lroc_nac",
        "name": "LROC NAC via QuickMap",
        "description": "Imagerie Narrow Angle Camera référencée dans QuickMap. Fichier non copié.",
        "version": "quickmap-catalog",
        "citation": "NASA/GSFC/Arizona State University, LROC QuickMap, https://quickmap.lroc.asu.edu/",
        "uncertainty_notes": "Résolution native variable selon le produit NAC. Non téléchargé.",
        "resolution": "variable, ordre du mètre",
        "units": "image",
        "coverage": True,
    },
    {
        "source": "quickmap",
        "product_code": "lroc_wac",
        "name": "LROC WAC via QuickMap",
        "description": "Imagerie Wide Angle Camera référencée dans QuickMap. Fichier non copié.",
        "version": "quickmap-catalog",
        "citation": "NASA/GSFC/Arizona State University, LROC QuickMap, https://quickmap.lroc.asu.edu/",
        "uncertainty_notes": "Produit de contexte global. Non téléchargé.",
        "resolution": "ordre de 100 m/pixel",
        "units": "image",
        "coverage": True,
    },
    {
        "source": "quickmap",
        "product_code": "lola_dem",
        "name": "LOLA DEM via QuickMap",
        "description": "Modèle numérique de terrain LOLA référencé dans QuickMap. Grille non copiée.",
        "version": "quickmap-catalog",
        "citation": "NASA GSFC LOLA, visualisé dans LROC QuickMap, https://quickmap.lroc.asu.edu/",
        "uncertainty_notes": "Le MNT n'est pas chargé. L'altitude d'un site reste une métadonnée citée.",
        "resolution": "grille LOLA publiée",
        "units": "m",
        "coverage": True,
    },
    {
        "source": "moon_trek",
        "product_code": "moon_trek_lola",
        "name": "Moon Trek — couche LOLA",
        "description": "Couche topographique LOLA exposée par Moon Trek. Tuiles non proxifiées.",
        "version": "moon-trek-catalog",
        "citation": "NASA Moon Trek, https://trek.nasa.gov/moon/",
        "uncertainty_notes": "Couche de visualisation externe.",
        "resolution": "couche Trek",
        "units": "m",
        "coverage": True,
    },
    {
        "source": "moon_trek",
        "product_code": "moon_trek_lroc",
        "name": "Moon Trek — couche LROC",
        "description": "Couche d'imagerie LROC exposée par Moon Trek. Tuiles non proxifiées.",
        "version": "moon-trek-catalog",
        "citation": "NASA Moon Trek, https://trek.nasa.gov/moon/",
        "uncertainty_notes": "Couche de visualisation externe.",
        "resolution": "couche Trek",
        "units": "image",
        "coverage": True,
    },
]

LINKED_PRODUCTS = (
    "lroc_wac",
    "lola_dem",
    "moon_trek_lola",
    "moon_trek_lroc",
    "horizons_ephemeris",
)


def seed_nasa_datasets(apps, schema_editor):
    DataSource = apps.get_model("datasets", "DataSource")
    Dataset = apps.get_model("datasets", "Dataset")
    DatasetVersion = apps.get_model("datasets", "DatasetVersion")
    DatasetCoverage = apps.get_model("datasets", "DatasetCoverage")
    SiteDataset = apps.get_model("datasets", "SiteDataset")
    LunarSite = apps.get_model("catalog", "LunarSite")

    sources = {}
    for item in SOURCES:
        source, _created = DataSource.objects.get_or_create(
            code=item["code"],
            defaults={key: value for key, value in item.items() if key != "code"},
        )
        sources[item["code"]] = source

    datasets = {}
    for item in DATASETS:
        dataset, _created = Dataset.objects.get_or_create(
            source=sources[item["source"]],
            product_code=item["product_code"],
            defaults={"name": item["name"], "description": item["description"]},
        )
        datasets[item["product_code"]] = dataset
        version, _created = DatasetVersion.objects.get_or_create(
            dataset=dataset,
            version=item["version"],
            defaults={
                "status": "candidate",
                "citation": item["citation"],
                "uncertainty_notes": item["uncertainty_notes"],
                "metadata": {"download": False, "source": item["source"]},
            },
        )
        if item["coverage"] and not DatasetCoverage.objects.filter(version=version).exists():
            DatasetCoverage.objects.create(
                version=version,
                resolution=item["resolution"],
                units=item["units"],
                **GLOBAL_BOUNDS,
            )

    for site in LunarSite.objects.all():
        for product_code in LINKED_PRODUCTS:
            SiteDataset.objects.get_or_create(site=site, dataset=datasets[product_code])
