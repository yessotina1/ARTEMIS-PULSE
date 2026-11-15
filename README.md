# ARTEMIS PULSE

Le moteur scientifique est branché sur l'API Django. Sans `DATABASE_URL`, le site tourne sur SQLite.

```powershell
cd C:\Users\TestWindows\Projects\artemis-pulse
.\.venv\Scripts\python.exe -m pip install -e "apps/backend"
cd apps\backend
..\..\.venv\Scripts\python.exe manage.py migrate
..\..\.venv\Scripts\python.exe manage.py seed_sites
..\..\.venv\Scripts\python.exe manage.py runserver
```

Ouvrez http://127.0.0.1:8000/ . L'évaluation directe est aussi `GET /api/analyses/evaluate/?site=apollo11&epoch=1969-07-20T20:17:40`.

Avec une URL Neon dans `DATABASE_URL`, `manage.py` utilise `config.settings.development` et PostGIS. Le frontend Next.js n'est pas encore écrit : `apps/web` réserve seulement son emplacement.

## Moteur seul

Fonctions Python qui prennent un site lunaire et une date UTC et renvoient l'élévation du Soleil, l'élévation de la Terre, l'éclairement d'une surface horizontale et le temps de lumière. Les unités et les conventions sont dans chaque résultat, champ `conventions`.

## Lancer

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
python -m pytest
python -m apps.backend.scientific apollo11 1969-07-20T20:17:40
```

Un site libre se donne par `--lat` et `--lon` en degrés, hauteur optionnelle en mètres au-dessus de la sphère de 1737,4 km.

## Ce qui est calculé

- Repère MOON_ME, azimut nord vers est, élévation géométrique sans réfraction.
- Éphéméride locale (Meeus tronqué + orientation IAU). Erreur typique : quelques dixièmes de degré.
- Horizons (`fetch_vectors`, `fetch_observer`, `HorizonsEphemeris`) si le réseau est disponible. L'observateur est `coord@301`, mode `AIRLESS`. Le 20 juillet 1969 à 20:17:40 UTC, Horizons donne à Apollo 11 un Soleil à 10,70° d'élévation et 88,81° d'azimut ; le modèle local tombe à moins de 0,05° de ces deux valeurs.
- SPICE via SpiceyPy si des noyaux sont dans un dossier. `kernel_status` liste les fichiers. Les URL NAIF sont dans `sources/nasa/spice_kernels.py`. `de440.bsp` n'est pas téléchargé.
- MNT : GeoTIFF (rasterio), étiquette PDS3, ou JSON + binaire. `compute_horizon_profile` lance des rayons en tenant compte de la courbure.
- LROC : emprise, URL WMS GetMap, lecture d'une étiquette. Les images NAC ne sont pas téléchargées.

Sans MNT, l'horizon est celui de la sphère. Au pôle Sud, le relief change le coucher : il faut un extrait LOLA.

La prédiction des levers et couchers (220 jours, pas de 6 h) utilise l'éphéméride locale ou SPICE, pas une requête Horizons par pas.
