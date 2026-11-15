# ARTEMIS PULSE

Plateforme d'exploration et de planification de sites du pôle Sud lunaire.
Le navigateur affiche ce que l'API fournit. Il ne calcule ni l'illumination,
ni la visibilité de la Terre, ni l'énergie produite.

## État actuel

Deux modes coexistent.

- **Démonstration** (`NEXT_PUBLIC_USE_MOCKS` non défini ou différent de `false`) : le front
  montre des écrans complets alimentés par des jeux locaux. Un bandeau l'indique.
- **Produit** (`NEXT_PUBLIC_USE_MOCKS=false`) : le front parle à Django.

En mode produit, ce qui est réel :

- inscription, connexion, déconnexion et demande de réinitialisation de mot de passe ;
- profils Planificateur, Éducateur et Explorateur ;
- catalogue des sites (nom, coordonnées, description, caractéristiques) ;
- enregistrement d'un scénario (site, observateur, fenêtre UTC, nombre de pas demandé).

Ce qui n'est pas calculé, et n'est donc pas inventé :

- illumination, visibilité géométrique, profil d'horizon, flux solaire ;
- séries temporelles et fenêtres (listes vides) ;
- score de comparaison (l'API répond `409 NOT_COMPUTED`) ;
- rapports (liste vide).

Une exécution de scénario est enregistrée avec le statut `FAILED` et le code `NOT_COMPUTED`.

## Lancer le produit

Backend, depuis `apps/backend` :

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements\base.txt
$env:DJANGO_SETTINGS_MODULE = "config.settings.development"
# Sans DATABASE_URL, Django démarre sur un fichier SQLite local (dev.sqlite3).
# Avec DATABASE_URL et DATABASE_URL_DIRECT, les migrations vont sur Neon.
.\.venv\Scripts\python.exe manage.py migrate
.\.venv\Scripts\python.exe manage.py runserver
```

Les tests n'utilisent pas Neon :

```powershell
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
.\.venv\Scripts\python.exe manage.py test
```

Front, depuis `apps/web` :

```powershell
npm install
$env:NEXT_PUBLIC_USE_MOCKS = "false"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000/api/v1"
npm run dev
```

OpenAPI : `http://localhost:8000/api/docs/`.

## API utilisée par le front

Préfixe `/api/v1`. Jeton `Authorization: Token …` après connexion.

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| POST | `/auth/register` | Créer un compte |
| POST | `/auth/login` | Ouvrir une session |
| POST | `/auth/logout` | Révoquer le jeton |
| POST | `/auth/password-reset` | Demander un e-mail de réinitialisation |
| GET | `/sites`, `/sites/{id\|slug}` | Catalogue, sans résultat scientifique |
| GET, POST | `/scenarios` | Scénarios de l'utilisateur |
| DELETE | `/scenarios/{id}` | Retirer un scénario |
| GET, POST | `/scenarios/{id}/runs` | Historique et demande d'exécution |
| GET | `/runs`, `/runs/{id}` | Statut d'exécution |
| GET | `/runs/{id}/series` | Série vide tant que le calcul n'existe pas |
| GET | `/runs/{id}/visibility-windows` | Aucune fenêtre tant que le calcul n'existe pas |
| GET, POST | `/comparisons` | Liste vide ; la création est refusée |
| GET | `/reports` | Liste vide |

Les routes `/api/accounts/`, `/api/catalog/` et `/api/datasets/` restent disponibles
pour la gestion directe des comptes, des sites et des métadonnées NASA.

## Base de données

PostgreSQL est hébergé sur Neon (PostgreSQL 17, PostGIS 3.5.7).
`DATABASE_URL` est le pooler. `DATABASE_URL_DIRECT` sert aux migrations.
Aucune base PostgreSQL locale n'est déclarée dans Docker Compose.
Les coordonnées lunaires sont des décimales avec un référentiel explicite.
`WGS84` et `EPSG:4326` sont refusés.

## Ce qui reste à construire

Le moteur scientifique (Horizons, SPICE, LOLA, LROC), l'énergie, les fenêtres
de communication, les comparaisons chiffrées, les rapports exportés, l'éducation
persistée et le branchement Neon si les variables d'environnement ne sont pas
encore renseignées.
