# ARTEMIS PULSE — Front-end (apps/web)

Suivi d'avancement de la construction du front-end. Une tâche = un commit (`feat(web): <tâche>`).

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
- [x] 11. Espace d analyse Soleil/Terre et polling du run.
- [x] 12. Chronologie : fenêtres d'illumination et de visibilité terrestre, curseur, lecture/pause.
- [x] 13. Comparateur de 2 à 4 scénarios avec courbes recharts et score pondéré.
- [x] 14. Détail d un scénario sauvegardé, Rapports, Paramètres.
- [ ] 15. Passe finale : accessibilité, responsive, états, README apps/web.

## Arbitrage des maquettes

- **Dashboard** : version desktop (barre latérale + grille de cartes) retenue ; la version mobile devient la variante responsive (< 1024 px).
- **Nouvelle analyse** : « assistant_de_scénario » retenue ; « calculateur_de_mission » ignorée (doublon).
- **Explorateur** : `explorer_la_lune_cartographie_p_le_sud` retenue — elle contient la carte polaire interactive, la fiche du site et le cadre méthodologique, plus complète que `explorer_la_lune_cartographie_3d` (globe seul). Le globe Cesium reste fourni via l'onglet « Globe 3D ».
- **Comparateur** : `comparateur_de_sc_narios_artemis_pulse_2` retenue (vue tabulaire multi-scénarios + courbes) ; la version 1 (duel de deux cartes) sert de variante « duel » sur mobile.
- **Hors périmètre** : tout ce qui relève du budget de liaison radio (stations DSN, Ka-band/dB, marge multipath, réserve d'atténuation RF, OWLT) est retiré des écrans. Seule la visibilité géométrique est affichée.

## Hypothèses d'API (à valider avec l'équipe)

_Voir la section finale en bas de ce document._

## Journal

_(mis à jour au fil des tâches)_
