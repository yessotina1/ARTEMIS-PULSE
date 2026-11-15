# ARTEMIS PULSE — Front-end (apps/web)

Suivi de la construction du front-end. Une tâche = un commit (`feat(web): <tâche>`).
Dernière mise à jour : 15 novembre 2026 — tâche 29 livrée.

## Tâches

- [x] 1. Design system : tokens Tailwind depuis le frontmatter de DESIGN.md, polices next/font (Space Grotesk, Inter, JetBrains Mono), fond sombre, page /design-system de vérification.
- [x] 2. Composants UI : Button, Card, Input, Select, Badge, VisibilityBadge, QualityBadge, Timestamp UTC, Metric, Tabs, Modal, états Loading/Empty/Error, bannière d'hypothèses.
- [x] 3. Types et client API : src/types, src/lib/api, mocks réalistes, hooks React Query.
- [x] 4. Layout et navigation : barre latérale, en-tête, responsive, groupes de routes (public), (planner).
- [x] 5. Authentification (UI) : connexion / inscription / mot de passe oublié, branchée sur les mocks.
- [x] 6. Pages publiques : accueil, fiche publique d'un site, analyse de démonstration en mode invité.
- [x] 7. Tableau de bord Planificateur.
- [x] 8. Catalogue des sites et fiche détaillée d'un site.
- [x] 9. Explorateur lunaire : globe CesiumJS dynamique + repli carte 2D polaire.
- [x] 10. Assistant de scénario en 4 étapes avec validation zod.
- [x] 11. Espace d'analyse Soleil/Terre et polling du run.
- [x] 12. Chronologie : fenêtres d'illumination et de visibilité terrestre, curseur, lecture/pause.
- [x] 13. Comparateur de 2 à 4 scénarios avec courbes recharts et score pondéré.
- [x] 14. Détail d'un scénario sauvegardé, Rapports, Paramètres.
- [x] 15. Passe finale : accessibilité, responsive, états, README apps/web.
- [x] 29. Accueil avec Lune 3D (three / R3F / drei) : hero immersif, récit « Trois questions », vignettes « Trois espaces », repli statique.

## Arbitrage des maquettes

- **Dashboard** : version desktop (barre latérale + grille de cartes) retenue ; la version mobile devient la variante responsive (< 1024 px).
- **Nouvelle analyse** : « assistant_de_scénario » retenue ; « calculateur_de_mission » ignorée (doublon).
- **Explorateur** : `explorer_la_lune_cartographie_p_le_sud` retenue — carte polaire interactive, fiche du site et cadre méthodologique, plus complète que `explorer_la_lune_cartographie_3d` (globe seul). Le globe Cesium est fourni via l'onglet « Globe 3D ».
- **Comparateur** : `comparateur_de_sc_narios_artemis_pulse_2` retenue (tableau multi-scénarios + courbes) ; la version 1 (duel de cartes) inspire la variante mobile condensée.
- **Hors périmètre** : tout le budget de liaison radio (stations DSN, Ka-band/dB, marge multipath, réserve d'atténuation RF, OWLT) est retiré. Seule la visibilité géométrique est affichée, avec les deux mentions obligatoires.

## Ce qui est fait

- **Design system** : tokens issus du frontmatter (surfaces, accents, sémantique de visibilité et de qualité), rayons, espacements, échelle typographique. Trois polices via `next/font`. Page `/design-system` de contrôle.
  - Écart assumé : `body-sm`, `label-md`, `label-sm` passent de 10–11 px à **12 px** pour respecter la règle d'accessibilité.
  - Les couleurs sémantiques FULL/PARTIAL/OCCULTED/UNKNOWN et les niveaux de qualité proviennent du corps de DESIGN.md (absents du frontmatter).
- **Composants UI** : tous les composants demandés, plus `RunStatusBadge`, `PartialDataNotice`, `DemoBanner`. Interface clavier (onglets, modale avec piège de focus, Échap, restitution du focus).
- **API** : contrat typé, client fetch avec erreurs `{code, message, details, requestId}` et timeout, mocks réalistes (8 sites du pôle Sud, 6 scénarios, 7 runs dont QUEUED/RUNNING/SUCCEEDED/FAILED, séries, fenêtres, comparaisons, rapports), hooks React Query dont polling du run toutes les 2 s.
- **Écrans** : accueil public, fiche publique de site, démonstration invitée, connexion / inscription (3 profils) / mot de passe oublié, tableau de bord, catalogue + fiche, explorateur (Cesium + repli polaire), assistant 4 étapes, espace d'analyse (Soleil, Terre, horizon, scène), chronologie avec lecture/pause et marqueurs, comparateur 2–4 scénarios (tableau, courbes alignées, score pondérable, contraintes critiques séparées), mes scénarios + détail, rapports, paramètres, documentation.
- **Qualité** : `npm run lint` et `npm run build` passent après chaque tâche. Textes ≥ 12 px (y compris les libellés SVG). États chargement / vide / erreur / données partielles sur chaque écran de données. Responsive desktop → mobile avec menu latéral escamotable.

## Ce qui est bloqué / non vérifié

- **Rendu 3D Cesium** : non vérifié visuellement (WebGL indisponible dans l'environnement de build). Repli polaire opérationnel derrière la même interface ; voir `docs/FRONTEND_BLOCKERS.md`.
- **Rendu 3D Lune (accueil, tâche 29)** : non vérifié visuellement dans cet environnement (WebGL indisponible). `npm run lint` et `npm run build` passent ; repli `MoonFallback` et poster de chargement couvrent l'absence de WebGL / textures. Textures `/public/textures/moon-*.webp` à fournir par Tompkins.
- **Authentification** : locale (`localStorage`), sans API ni sécurité réelle.
- **Téléchargement de rapports** : export JSON local de démonstration, faute de route API.
- Aucun test end-to-end ni audit d'accessibilité automatisé n'a été exécuté (hors périmètre demandé).

## Passe de correction

Une revue du rendu a suivi les 15 tâches : jetons d'espacement qui écrasaient `max-w-*`,
`<p>` imbriqué de `DemoBanner`, appel Cesium invalide, valeurs codées en dur remplacées par les
données de l'API, débordement mobile du tableau de bord. Détail dans `docs/FRONTEND_BLOCKERS.md`.

## Hypothèses d'API (à valider avec l'équipe)

Base : `/api/v1`. Dates ISO 8601 UTC. Les types de `src/types` font foi.

| Route supposée | Usage front |
| --- | --- |
| `GET /sites` (query `search`, `category`, `demStatus`, `mission`, `region`) | catalogue, explorer |
| `GET /sites/{id|slug}` | fiche site publique et planificateur |
| `GET /scenarios`, `GET /scenarios/{id}` | tableaux de bord, détail |
| `POST /scenarios`, `DELETE /scenarios/{id}` | assistant de scénario |
| `GET /runs` | **hypothèse ajoutée** : liste globale des runs pour le tableau de bord |
| `GET /runs/{id}`, `GET /scenarios/{id}/runs`, `POST /scenarios/{id}/runs` | polling, historique, relance |
| `GET /runs/{id}/series` | courbes et chronologie |
| `GET /runs/{id}/visibility-windows` | fenêtres Soleil / Terre |
| `POST /comparisons`, `GET /comparisons` | comparateur |
| `GET /reports` | page Rapports (pas de route de téléchargement supposée) |

Détails de forme supposés :

- Enveloppe de liste `{ items: T[], meta?: { page, pageSize, total } }` **ou** tableau nu (tolérant).
- `Run.status` ∈ `QUEUED | RUNNING | SUCCEEDED | FAILED` ; `progressPercent` entier 0–100.
- `QualityLevel` ∈ `VALIDATED | ESTIMATED | LOW | UNCOMPUTABLE` (affiché VALIDÉ / ESTIMÉ / FAIBLE QUALITÉ / NON CALCULABLE).
- `VisibilityClass` ∈ `FULL | PARTIAL | OCCULTED | UNKNOWN`.
- `Scenario.window` contient `startUtc`, `endUtc`, `stepSeconds` et `steps` (nombre de pas calculé côté serveur).
- `Comparison.results[].score` est `null` si le score est désactivé ; les poids sont normalisés côté API.
- `Comparison.results[].constraints[].critical` distingue contraintes bloquantes et non critiques.
- Les champs optionnels `sceneImageUrl` / `illustrationUrl` ne sont pas utilisés (aucun asset fourni).
- L'authentification n'a aucun contrat API : l'UI utilise un store local de démonstration.
