# ARTEMIS PULSE — Front-end

Console de planification de la visibilité géométrique Soleil / Terre aux sites du pôle Sud lunaire.
Le navigateur **n'effectue aucun calcul scientifique** : il affiche ce que l'API renvoie.

## Stack

- Next.js 16 (App Router, Turbopack), React 19, TypeScript strict
- Tailwind CSS v4 — tokens issus du frontmatter de `docs/design/.../DESIGN.md`
- `@tanstack/react-query` (données et polling), `zod` (validation), `recharts` (courbes), CesiumJS (globe)

## Lancement

```bash
cd apps/web
npm install
npm run dev      # http://localhost:3000
```

Les assets Cesium sont copiés dans `public/cesium` par `scripts/copy-cesium.mjs`
(automatique via `predev` / `prebuild`, aucun token Cesium ion requis).

Variables publiques :

| Variable | Défaut | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_USE_MOCKS` | `true` | Utilise `src/lib/api/mock-api.ts` |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api/v1` | Base de l'API quand les mocks sont désactivés |

Vérifications : `npm run lint`, `npm run build`.

## Organisation

```
src/app/
  (public)/        accueil, fiche publique de site, démonstration, connexion/inscription
  (planner)/       console : tableau de bord, catalogue, explorateur, analyses,
                   scénarios, comparateur, rapports, documentation, paramètres
  design-system/   vérification des tokens et composants
src/components/
  ui/              Button, Card, Badge, VisibilityBadge, QualityBadge, Metric,
                   Timestamp, Tabs, Modal, états Loading/Empty/Error, bannière d'hypothèses
  layout/          AppShell, barre latérale, en-tête, en-tête public
  lunar/           carte polaire SVG, profil d'horizon, scène du site
  auth/            mise en page des écrans d'authentification
src/features/      dashboard, catalogue, lunar-explorer, mission-planner,
                   comparator, scenarios, reports, settings, auth
src/hooks/         hooks React Query (sites, scénarios, runs avec polling, comparaisons…)
src/lib/api/       contrat, client HTTP typé, mocks, point d'entrée `api`
src/types/         types alignés sur les routes de l'API
```

## Règles d'affichage appliquées

- Dates en UTC, format `YYYY-MM-DD HH:mm UTC`.
- Chaque valeur affiche son unité ; azimut dans `[0, 360[`, élévation signée.
- Visibilité : `FULL`, `PARTIAL`, `OCCULTED`, `UNKNOWN` — toujours libellé + icône.
- Qualité : `VALIDÉ`, `ESTIMÉ`, `FAIBLE QUALITÉ`, `NON CALCULABLE`.
- Chaque résultat affiche source, version des données et lien « Hypothèses et limites ».
- Mentions obligatoires : « Terre visible = visibilité géométrique, pas une garantie de liaison radio »
  et « Soleil visible ≠ énergie produite ».
- Bandeau « Données de démonstration » tant que `NEXT_PUBLIC_USE_MOCKS=true`.
- Budget de liaison radio (DSN, Ka-band, marge multipath, OWLT) volontairement absent.

## Explorateur

Onglet « Carte polaire » par défaut (SVG, sélection clavier). L'onglet « Globe 3D » charge
CesiumJS dynamiquement (`ssr: false`) sur un ellipsoïde lunaire de 1 737,4 km, sans imagerie
distante. En cas d'échec WebGL, la carte polaire reste affichée avec un message explicite.

## Limites connues

- Toutes les données proviennent de mocks ; l'API réelle n'est pas branchée.
- L'authentification est une démonstration locale (`localStorage`), sans sécurité réelle.
- Aucune vérification visuelle navigateur n'a été réalisée au-delà du build de production.
