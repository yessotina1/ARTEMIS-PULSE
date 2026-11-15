---
name: Artemis Pulse
colors:
  surface: '#0f131d'
  surface-dim: '#0f131d'
  surface-bright: '#343944'
  surface-container-lowest: '#090e17'
  surface-container-low: '#171c25'
  surface-container: '#1b2029'
  surface-container-high: '#252a34'
  surface-container-highest: '#30353f'
  on-surface: '#dee2f0'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dee2f0'
  inverse-on-surface: '#2c303b'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#1bbd85'
  on-tertiary-container: '#00452e'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0f131d'
  on-background: '#dee2f0'
  surface-variant: '#30353f'
typography:
  headline-xl:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 14px
    letterSpacing: 0.04em
  data-display:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-compact: 0.5rem
  margin: 1.5rem
  margin-mobile: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

Le système de conception incarne une esthétique d'ingénierie aérospatiale contemporaine : sobre, chirurgicale, orientée instrumentation critique et exploration lunaire de haute précision. 

### Personnalité et posture
- **Rigueur scientifique :** Priorité absolue à l'intégrité des données, à la lisibilité sans ambiguïté et à la contextualisation des marges d'erreur.
- **Atmosphère sidérale :** Immersion dans l'environnement lunaire hostile du Pôle Sud (ombres rasantes, contrastes binaires lumière/obscurité, topographie escarpée).
- **Sobriété fonctionnelle :** Aucune fioriture décorative superflue ; chaque gradient, bordure ou lueur véhicule un état opérationnel ou un niveau de certitude.

### Mouvements de design
Le parti-pris fusionne le **minimalisme technique** et un **tactile instrumental haute densité** :
- Fonds d'encre spatiale profonds réduisant la fatigue visuelle lors des quarts prolongés en salle de contrôle.
- Surfaces techniques structurées par des micro-lignes laser et des bordures à faible opacité.
- Accents cyan et bleu électrique guidant la focalisation cognitive sur les données dynamiques et les calculs d'éphémérides.

## Colors

La palette repose sur un étalonnage chromatique fonctionnel destiné aux consoles de surveillance et de planification.

### Surfaces et fonds
- **Fond de toile (Canvas) :** `#0a0f18` (Bleu nuit sidéral profond)
- **Surfaces primaires (Panels, Sidebars) :** `#0e1726`
- **Surfaces secondaires (Cards, Widgets) :** `#162032`
- **Surfaces surélevées (Modales, Menus flottants, Trays) :** `#1c283d`
- **Bordures structurelles neutres :** `#274060` (opacité 40% à 70%)

### Couleurs d'action et télémétrie
- **Accent primaire (Action & Focus) :** `#06b6d4` (Cyan spatial), décliné en `#22d3ee` (hover) et `#083344` (fonds d'accent).
- **Accent secondaire (Sélections & Télémétrie orbitale) :** `#3b82f6` (Bleu électrique).

### Sémantique de visibilité & occultation
- **FULL (Visibilité totale) :** `#10b981` (Vert émeraude scientifique)
- **PARTIAL (Visibilité partielle / Pénombre) :** `#f59e0b` (Ambre solaire)
- **OCCULTED (Occultation / Masquage topographique) :** `#ef4444` (Rouge critique)
- **UNKNOWN (Indéterminé / Zone d'ombre hors modèle) :** `#64748b` (Ardoise neutre)

### Niveaux de confiance des calculs
- **Validé (High confidence) :** Badge `#10b981` sur fond `#064e3b` (30%)
- **Estimé (Nominal / Interpolé) :** Badge `#38bdf8` sur fond `#0c4a6e` (30%)
- **Faible qualité (Marge d'erreur élevée) :** Badge `#f59e0b` sur fond `#78350f` (30%)
- **Non calculable (Singularité / Hors portée) :** Badge `#ef4444` sur fond `#7f1d1d` (30%)

## Typography

La typographie applique une séparation binaire stricte entre le guidage narratif et les données physiques brutes.

### Hiérarchie des familles
- **Titres et repères structurels :** `Space Grotesk` confère une signature technique pointue, géométrique et futuriste sans sacrifier la compacité.
- **Interface courante et descriptions d'hypothèses :** `Inter` offre une neutralité absolue et une lecture fluide des paragraphes méthodologiques ou des infobulles scientifiques.
- **Télémétrie, métriques et horodatages :** `JetBrains Mono` est réservé à toutes les grandeurs scalaires, coordonnées géodésiques lunaires, angles d'azimut/élévation et notations temporelles strictes (ex: `2026-11-14 08:42 UTC`).

### Registre marketing (extension accueil)
Réservé au **titre héro** de la page publique (`src/app/(public)/page.tsx`). Ce registre n'entre pas dans les consoles Planificateur / Éducateur / Explorateur.

- **Famille :** `Space Grotesk`, graisse 700.
- **Corps :** `clamp(40px, 6vw, 72px)`, interligne ≈ 1.05, tracking ≈ `-0.03em`.
- **Intention :** signature de marque immersive, toujours subordinée au produit « ARTEMIS PULSE » et à l'instrument (Lune informative). Un seul titre marketing par viewport ; le reste de la page reprend `headline-xl` / `headline-lg` / `headline-sm`.
- **Contraste :** dégradé surface → transparent entre le bloc texte et la Lune pour garantir un contraste texte ≥ 4.5:1.

### Règles de composition
- Les valeurs chiffrées doivent impérativement être rendues avec des chiffres tabulaires monospaces afin de garantir l'alignement vertical dans les tables d'éphémérides.
- Les unités de mesure (`km`, `W/m²`, `°`, `dB`) adoptent `label-sm` en gris atténué (`#64748b`) accolées immédiatement à la valeur sans espace insécable disruptive.

## Layout & Spacing

Le dimensionnement repose sur un agencement à haute densité d'informations conçu pour les écrans de consoles d'ingénieurs (multi-écrans 16:9 et 21:9) tout en garantissant une consultation de terrain réactive.

### Modèle de grille
- **Desktop (>= 1280px) :** Grille fluide modulaire de 12 ou 16 colonnes avec gouttières de `1rem` (16px) et marges externes de `1.5rem` (24px). Disposition en triptyque typique : Sélecteur de sites & paramètres temporels à gauche (3 colonnes), Visualisation 3D/Topographique & Profils d'élévation au centre (9 colonnes), Cartouches d'éphémérides instantanées à droite (4 colonnes).
- **Tablet / Laptop compact (768px - 1279px) :** Passage en 8 colonnes, réduction des marges à `1rem`, volets latéraux repliables en panneaux superposés.
- **Mobile (< 768px) :** Pile verticale mono-colonne, marge de `0.75rem`, commutation des vues via onglets de statuts inférieurs.

### Rythme spatial
Le pas de base est de 4px. Les composants de mesure d'éphémérides utilisent `space-sm` (8px) et `space-md` (12px) pour maximiser le champ visuel alloué aux courbes orbitales et aux tables numériques sans encombrement.

## Elevation & Depth

Le système rejette les ombres portées floues traditionnelles, incohérentes avec l'environnement lunaire sans atmosphère où la lumière ne diffuse pas.

### Hiérarchie par strates de luminance (Tonal Tiers)
- **Niveau 0 (Fond de carte / Vue spatiale) :** `#0a0f18` uni mat.
- **Niveau 1 (Conteneurs majeurs de télémétrie) :** `#0e1726` avec bordure continue de 1px en `#1c283d`.
- **Niveau 2 (Widgets d'instruments et blocs métriques) :** `#162032` avec bordure fine `#274060` devenant `#38bdf8` (opacité 30%) à l'état actif.
- **Niveau 3 (Overlays tactiques, tooltips d'éphémérides, modales de calibration) :** `#1c283d` avec contour net de 1px en `#38bdf8` (opacité 60%) et un rétro-éclairage diffus très localisé (`box-shadow: 0 0 16px rgba(6, 182, 212, 0.15)`).

### Lignes laser et réticules
Pour matérialiser les séparations de cadrans, le design utilise des séparateurs de 1px en `#274060` ponctuellement rehaussés aux angles par des micro-crochets de visée (esthétique cockpit scientifique).

## Shapes

Le langage de formes exprime la précision mécanique et l'instrumentation matérielle embarquée.

- **Rayon standard (`roundedness: 1` / 4px) :** Utilisé sur les boutons, cartes de télémétrie, champs de saisie et conteneurs d'éphémérides.
- **Micro-arrondis (2px) :** Appliqués aux badges de qualité de calcul, indicateurs de statut et curseurs de scrubbing temporel.
- **Angles droits découpés (Chanfreins techniques 45°) :** Optionnels sur les cartouches de statuts critiques d'occultation pour évoquer les instruments optiques spatiaux.

## Components

### 1. Widgets d'éphémérides et d'orbites
- **Architecture :** Cartouche compacte avec en-tête en `label-md` uppercase (`#64748b`), valeur centrale imposante en `data-display` (`JetBrains Mono`), et pied de métrique affichant la dérivée temporelle (ex: `+0.04°/min`).
- **Affichages normalisés :**
  - **Azimut :** `[000.0° - 359.9°]` avec boussole radiale miniature intégrée.
  - **Élévation :** Format signé `±XX.X°` (ex: `-01.4°` sous l'horizon lunaire, mis en exergue par un liseré ambre).
  - **Flux solaire :** Valeur numérique `XXXX W/m²` accompagnée d'une micro-jauge linéaire segmentée.

### 2. Badges de qualité de calcul
- **Composants d'intégrité :** Hauteur fixe de 20px, texte en `label-sm` bold, encadrement de 1px.
- **États :**
  - `VALIDÉ` : Vert `#10b981`, icône check circulaire miniature.
  - `ESTIMÉ` : Cyan `#38bdf8`, icône tilde/onde.
  - `FAIBLE QUALITÉ` : Ambre `#f59e0b`, icône triangle d'attention.
  - `NON CALCULABLE` : Rouge `#ef4444`, icône tiret barré.

### 3. Bannière d'hypothèses et avertissements scientifiques
- **Format obligatoire :** Bloc horizontal inséré en tête de rapport ou sous les graphes d'occultation.
- **Rendu :** Fond `#0e1726` à rayures diagonales discrètes (hachures techniques), bordure gauche de 3px cyan ou ambre, mention explicite du modèle d'élévation utilisé (ex: *MOLA/LOLA DEM 20m, Éphémérides DE440, Réfraction nulle*).

### 4. Horodatage & Sélecteur temporel
- **Timestamp UTC :** Rendu strict `YYYY-MM-DD HH:mm UTC` en `label-lg`.
- **Time Slider :** Barre d'épuration temporelle avec pas d'incrémentation (1 min, 10 min, 1 h) et marqueurs visuels des fenêtres d'occultation directe Terre/Soleil.

### 5. Sélecteur de sites multi-cibles
- **Pills de sélection :** Commutateurs de sites d'atterrissage du Pôle Sud (ex: *Shackleton Rim*, *Malapert Mountain*, *Connecting Ridge*). Les sites actifs présentent une bordure cyan `#06b6d4` avec point pulsant de coordonnées géodésiques.

### 6. Boutons et commandes
- **Primaire :** Fond `#06b6d4`, texte `#0a0f18` ultra-lisible, effet de surbrillance cyan à l'état actif.
- **Secondaire / Outil :** Fond transparent, bordure `#274060`, texte `#e2e8f0`, survol avec éclaircissement ardoise `#1c283d`.