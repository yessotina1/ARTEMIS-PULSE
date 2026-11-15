import type {
  Comparison,
  ComparisonConstraint,
  ComparisonCriterion,
  ComparisonMetrics,
  DataSource,
  DemCoverage,
  HorizonProfile,
  Report,
  Run,
  Scenario,
  SiteDetail,
  SeriesPoint,
  TimeSeries,
  VisibilityClass,
  VisibilityWindow,
} from "@/types";

/**
 * MOCKS — données de démonstration.
 * Aucun calcul scientifique n'est fait par le front : ces valeurs simulent
 * les réponses de l'API (`NEXT_PUBLIC_USE_MOCKS=true`).
 */

export const SOURCE: DataSource = {
  source: "SPICE / MOON_PA_DE440",
  version: "2029.1",
  model: "MOLA/LOLA DEM 20 m · réfraction nulle",
};

const FULL_DEM: DemCoverage = {
  status: "FULL",
  resolutionM: 5,
  source: "LOLA · 5 m/px",
};

function horizon(seed: number, base = 0.8, amplitude = 2.4): HorizonProfile {
  const samples = Array.from({ length: 72 }, (_, index) => {
    const azimuthDeg = index * 5;
    const crater = Math.sin(((azimuthDeg + seed * 11) * Math.PI) / 180) * amplitude;
    const ripple = Math.cos(((azimuthDeg + seed * 37) * Math.PI) / 36) * 0.7;
    return {
      azimuthDeg,
      elevationDeg: Number((base + crater + ripple).toFixed(2)),
    };
  });
  return { samples, resolutionDeg: 5, source: SOURCE };
}

export const SITES: SiteDetail[] = [
  {
    id: "site-shk-001",
    slug: "shackleton-rim-001",
    name: "Shackleton Rim Site 001",
    designation: "IAU-SP-SHK-001",
    category: "RIDGE",
    mission: "Artemis III",
    coordinates: { latitudeDeg: -89.782, longitudeDeg: 124.32, altitudeM: 1840.4 },
    quality: "VALIDATED",
    dem: FULL_DEM,
    illuminationPercent: 86.4,
    maxContinuousDarknessHours: 22.4,
    tags: ["Crête d'illumination", "Héritage Apollo", "PSR proche"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Crête continue de 12 km sur le bord du cratère Shackleton, à proximité immédiate des zones d'ombre permanente. Point de référence du programme Artemis pour l'atterrissage et l'analyse du régolithe.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 142.35, elevationDeg: 1.84 },
      earth: { azimuthDeg: 35.12, elevationDeg: 6.42 },
      sunVisibility: "FULL",
      earthVisibility: "PARTIAL",
      solarFluxWm2: 1361,
      quality: "VALIDATED",
      source: SOURCE,
    },
    horizonProfile: horizon(1, 0.6, 2.1),
    sceneImageUrl: "/media/site-scene-shackleton.png",
    illustrationUrl: "/media/site-public-shackleton.png",
  },
  {
    id: "site-mlp-004",
    slug: "malapert-mountain-plateau",
    name: "Malapert Mountain Plateau",
    designation: "IAU-SP-MLP-004",
    category: "PLATEAU",
    mission: "Artemis III / IV",
    coordinates: { latitudeDeg: -84.9, longitudeDeg: 12.9, altitudeM: 5020 },
    quality: "VALIDATED",
    dem: FULL_DEM,
    illuminationPercent: 92.8,
    maxContinuousDarknessHours: 14.1,
    tags: ["Haut plateau", "Relais Terre", "Horizon dégagé"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Plateau élevé du massif Malapert, l'un des rares points du pôle Sud dont l'horizon terrestre reste longuement dégagé. Excellent compromis entre ensoleillement et stabilité thermique.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 138.1, elevationDeg: 2.15 },
      earth: { azimuthDeg: 28.45, elevationDeg: 8.9 },
      sunVisibility: "FULL",
      earthVisibility: "FULL",
      solarFluxWm2: 1361,
      quality: "VALIDATED",
      source: SOURCE,
    },
    horizonProfile: horizon(2, 1.2, 1.4),
    sceneImageUrl: "/media/site-scene-malapert.png",
    illustrationUrl: "/media/site-public-malapert.png",
  },
  {
    id: "site-crd-002",
    slug: "connecting-ridge",
    name: "Connecting Ridge (Shackleton–Henson)",
    designation: "IAU-SP-CRD-002",
    category: "RIDGE",
    mission: "Candidat Artemis",
    coordinates: { latitudeDeg: -89.44, longitudeDeg: 222.15, altitudeM: 1240 },
    quality: "ESTIMATED",
    dem: FULL_DEM,
    illuminationPercent: 85.3,
    maxContinuousDarknessHours: 24.6,
    tags: ["Crête de liaison", "Traverse", "Zone clé"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Crête reliant les massifs Shackleton et Henson, identifiée comme zone clé d'atterrissage. Le profil d'horizon reste synthétique sur deux secteurs d'azimut.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 142.8, elevationDeg: 0.95 },
      earth: { azimuthDeg: 35.2, elevationDeg: 4.8 },
      sunVisibility: "FULL",
      earthVisibility: "OCCULTED",
      solarFluxWm2: 1358,
      quality: "ESTIMATED",
      source: SOURCE,
    },
    horizonProfile: horizon(3, 0.4, 2.8),
    sceneImageUrl: "/media/site-scene-connecting.png",
    illustrationUrl: "/media/site-public-connecting.png",
  },
  {
    id: "site-fau-001",
    slug: "faustini-crater-rim",
    name: "Faustini Crater Rim",
    designation: "IAU-SP-FAU-01",
    category: "CRATER_RIM",
    mission: "VIPER / CLPS",
    coordinates: { latitudeDeg: -87.3, longitudeDeg: 84.1, altitudeM: -120 },
    quality: "LOW",
    dem: {
      status: "PARTIAL",
      resolutionM: 20,
      source: "MOLA · 20 m/px",
      note: "Couverture DEM partielle : deux secteurs interpolés, incertitude d'horizon jusqu'à ±3,5°.",
    },
    illuminationPercent: 71.2,
    maxContinuousDarknessHours: 61.8,
    tags: ["PSR", "Glace", "Risque géologique"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Bord de cratère surplombant un piège froid permanent riche en glace d'eau. La couverture DEM limitée impose de traiter les fenêtres de visibilité comme des estimations.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 121.4, elevationDeg: -0.35 },
      earth: { azimuthDeg: 41.7, elevationDeg: 2.1 },
      sunVisibility: "PARTIAL",
      earthVisibility: "UNKNOWN",
      solarFluxWm2: 0,
      quality: "LOW",
      source: SOURCE,
    },
    horizonProfile: horizon(4, 2.2, 3.6),
    sceneImageUrl: null,
    illustrationUrl: "/media/site-public-faustini.png",
  },
  {
    id: "site-amn-002",
    slug: "amundsen-rim-beta",
    name: "Amundsen Rim Crater Beta",
    designation: "IAU-SP-AMN-002",
    category: "CRATER_RIM",
    mission: "CLPS",
    coordinates: { latitudeDeg: -84.5, longitudeDeg: 82.86, altitudeM: -950 },
    quality: "ESTIMATED",
    dem: FULL_DEM,
    illuminationPercent: 63.5,
    maxContinuousDarknessHours: 78.2,
    tags: ["Site d'atterrissage", "Cratère Amundsen"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Bord intérieur du cratère Amundsen, candidat pour l'atterrissage CLPS. Pente moyenne élevée, horizon local accidenté.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 117.9, elevationDeg: 3.4 },
      earth: { azimuthDeg: 44.2, elevationDeg: 1.1 },
      sunVisibility: "FULL",
      earthVisibility: "PARTIAL",
      solarFluxWm2: 1032,
      quality: "ESTIMATED",
      source: SOURCE,
    },
    horizonProfile: horizon(5, 1.6, 4.2),
    sceneImageUrl: null,
    illustrationUrl: null,
  },
  {
    id: "site-lbz-009",
    slug: "leibnitz-plateau-outskirts",
    name: "Leibnitz Plateau Outskirts",
    designation: "IAU-SP-LBZ-09",
    category: "PLATEAU",
    mission: "Étude prospective",
    coordinates: { latitudeDeg: -79.28, longitudeDeg: 178.5, altitudeM: 2110 },
    quality: "UNCOMPUTABLE",
    dem: {
      status: "NONE",
      resolutionM: null,
      source: null,
      note: "Aucune couverture DEM locale : la visibilité géométrique n'est pas calculable pour ce point.",
    },
    illuminationPercent: null,
    maxContinuousDarknessHours: null,
    tags: ["Zone d'exploration", "DEM absente"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Extension du plateau Leibnitz hors couverture DEM. Le site est affiché à titre d'exploration : aucune fenêtre de visibilité ne peut être produite.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 98.1, elevationDeg: 4.9 },
      earth: { azimuthDeg: 22.4, elevationDeg: 3.2 },
      sunVisibility: "UNKNOWN",
      earthVisibility: "UNKNOWN",
      solarFluxWm2: 1361,
      quality: "UNCOMPUTABLE",
      source: SOURCE,
    },
    horizonProfile: null,
    sceneImageUrl: null,
    illustrationUrl: null,
  },
  {
    id: "site-a11-001",
    slug: "apollo-11-statio-tranquillitatis",
    name: "Apollo 11 — Statio Tranquillitatis",
    designation: "IAU-AP11-001",
    category: "HISTORIC",
    mission: "Apollo 11 (1969)",
    coordinates: { latitudeDeg: 0.674, longitudeDeg: 23.472, altitudeM: -2600 },
    quality: "VALIDATED",
    dem: { status: "FULL", resolutionM: 0.5, source: "NAC · 0,5 m/px" },
    illuminationPercent: 50,
    maxContinuousDarknessHours: 354.2,
    tags: ["Site historique", "Référence pédagogique"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Site historique des missions Apollo, conservé comme référence pédagogique et comme point de comparaison équatorial.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 210.5, elevationDeg: 42.6 },
      earth: { azimuthDeg: 178.2, elevationDeg: 63.1 },
      sunVisibility: "FULL",
      earthVisibility: "FULL",
      solarFluxWm2: 1361,
      quality: "VALIDATED",
      source: SOURCE,
    },
    horizonProfile: horizon(6, 0.2, 0.6),
    sceneImageUrl: null,
    illustrationUrl: null,
  },
  {
    id: "site-usr-001",
    slug: "point-utilisateur-alpha-base",
    name: "Point Utilisateur #1 (Alpha-Base)",
    designation: "USR-SP-001",
    category: "CUSTOM",
    mission: "Mission test privée",
    coordinates: { latitudeDeg: -86.5, longitudeDeg: 45, altitudeM: 1020 },
    quality: "ESTIMATED",
    dem: {
      status: "NONE",
      resolutionM: null,
      source: null,
      note: "Coordonnées personnalisées : aucune couverture DEM disponible.",
    },
    illuminationPercent: null,
    maxContinuousDarknessHours: null,
    tags: ["Point personnalisé"],
    referenceEphemerisUtc: "2030-01-01T12:00:00Z",
    description:
      "Point géodésique personnalisé saisi par l'utilisateur. Les valeurs affichées restent estimées jusqu'à l'ajout d'un modèle de terrain local.",
    referenceState: {
      atUtc: "2030-01-01T12:00:00Z",
      sun: { azimuthDeg: 135.2, elevationDeg: 1.1 },
      earth: { azimuthDeg: 33.4, elevationDeg: 3.8 },
      sunVisibility: "UNKNOWN",
      earthVisibility: "UNKNOWN",
      solarFluxWm2: 1361,
      quality: "ESTIMATED",
      source: SOURCE,
    },
    horizonProfile: null,
    sceneImageUrl: null,
    illustrationUrl: null,
  },
];

const scenarioDefaults = {
  observer: { name: "Observateur principal", heightM: 1.8, mode: "SITE_SURFACE" as const },
  source: SOURCE,
};

export const SCENARIOS: Scenario[] = [
  {
    id: "scn-art3-001",
    name: "Artemis III — Shackleton Rim Site 001",
    siteId: "site-shk-001",
    siteName: "Shackleton Rim Site 001",
    observer: { name: "Observateur sol", heightM: 1.8, mode: "SITE_SURFACE" },
    window: {
      startUtc: "2030-03-15T00:00:00Z",
      endUtc: "2030-03-29T00:00:00Z",
      stepSeconds: 3600,
      steps: 336,
    },
    status: "READY",
    quality: "VALIDATED",
    createdAt: "2026-03-02T09:14:00Z",
    updatedAt: "2026-03-02T09:21:00Z",
    lastRunId: "run-ap-8444",
    tags: ["Artemis III", "Référence"],
    notes: "Scénario de référence pour la fenêtre d'atterrissage de mars 2030.",
    owner: "Camille Roux",
    source: SOURCE,
  },
  {
    id: "scn-art3-002",
    name: "Fenêtre d'atterrissage Shackleton Rim B",
    siteId: "site-shk-001",
    siteName: "Shackleton Rim Site 001",
    observer: { name: "Observateur principal", heightM: 1.8, mode: "SITE_SURFACE" },
    window: {
      startUtc: "2030-01-01T00:00:00Z",
      endUtc: "2030-01-15T00:00:00Z",
      stepSeconds: 600,
      steps: 2016,
    },
    status: "READY",
    quality: "ESTIMATED",
    createdAt: "2026-02-27T16:40:00Z",
    updatedAt: "2026-02-27T16:52:00Z",
    lastRunId: "run-ap-8443",
    tags: ["Artemis III", "Atterrissage"],
    owner: "Camille Roux",
    source: SOURCE,
  },
  {
    id: "scn-mlp-014",
    name: "Profil éclipse Solaire Malapert 14j",
    siteId: "site-mlp-004",
    siteName: "Malapert Mountain Plateau",
    ...scenarioDefaults,
    window: {
      startUtc: "2030-01-01T00:00:00Z",
      endUtc: "2030-01-15T00:00:00Z",
      stepSeconds: 3600,
      steps: 336,
    },
    status: "READY",
    quality: "VALIDATED",
    createdAt: "2026-02-24T08:05:00Z",
    updatedAt: "2026-02-24T08:09:00Z",
    lastRunId: "run-ap-8445",
    tags: ["Énergie", "Malapert"],
    owner: "Nadia Belkacem",
    source: SOURCE,
  },
  {
    id: "scn-conn-007",
    name: "Visibilité géométrique Connecting Ridge",
    siteId: "site-crd-002",
    siteName: "Connecting Ridge (Shackleton–Henson)",
    ...scenarioDefaults,
    window: {
      startUtc: "2030-01-01T00:00:00Z",
      endUtc: "2030-01-15T00:00:00Z",
      stepSeconds: 1800,
      steps: 672,
    },
    status: "READY",
    quality: "ESTIMATED",
    createdAt: "2026-02-20T11:30:00Z",
    updatedAt: "2026-02-20T11:44:00Z",
    lastRunId: "run-ap-8446",
    tags: ["Traverse"],
    owner: "Camille Roux",
    source: SOURCE,
  },
  {
    id: "scn-fau-003",
    name: "Micro-reliefs Faustini Crater Rim",
    siteId: "site-fau-001",
    siteName: "Faustini Crater Rim",
    ...scenarioDefaults,
    window: {
      startUtc: "2030-01-01T00:00:00Z",
      endUtc: "2030-01-08T00:00:00Z",
      stepSeconds: 3600,
      steps: 168,
    },
    status: "FAILED",
    quality: "LOW",
    createdAt: "2026-02-18T14:02:00Z",
    updatedAt: "2026-02-18T14:03:00Z",
    lastRunId: "run-ap-8441",
    tags: ["PSR", "Glace"],
    notes: "Couverture DEM insuffisante sur le secteur sud-est.",
    owner: "Nadia Belkacem",
    source: SOURCE,
  },
  {
    id: "scn-draft-001",
    name: "Reconnaissance Amundsen Beta",
    siteId: "site-amn-002",
    siteName: "Amundsen Rim Crater Beta",
    ...scenarioDefaults,
    window: {
      startUtc: "2030-04-02T00:00:00Z",
      endUtc: "2030-04-09T00:00:00Z",
      stepSeconds: 900,
      steps: 672,
    },
    status: "DRAFT",
    quality: "ESTIMATED",
    createdAt: "2026-03-05T07:18:00Z",
    updatedAt: "2026-03-05T07:18:00Z",
    lastRunId: null,
    tags: ["Brouillon"],
    owner: "Camille Roux",
    source: SOURCE,
  },
];

export const RUNS: Run[] = [
  {
    id: "run-ap-8444",
    scenarioId: "scn-art3-001",
    status: "SUCCEEDED",
    progressPercent: 100,
    submittedAtUtc: "2026-03-02T09:14:00Z",
    startedAtUtc: "2026-03-02T09:15:00Z",
    finishedAtUtc: "2026-03-02T09:21:00Z",
    quality: "VALIDATED",
    source: SOURCE,
    error: null,
    summary: {
      sunVisibleSeconds: 1_045_800,
      earthVisibleSeconds: 742_500,
      longestNightSeconds: 80_640,
      stepsCompleted: 336,
      stepsTotal: 336,
    },
  },
  {
    id: "run-ap-8443",
    scenarioId: "scn-art3-002",
    status: "SUCCEEDED",
    progressPercent: 100,
    submittedAtUtc: "2026-02-27T16:40:00Z",
    startedAtUtc: "2026-02-27T16:41:00Z",
    finishedAtUtc: "2026-02-27T16:52:00Z",
    quality: "ESTIMATED",
    source: SOURCE,
    error: null,
    summary: {
      sunVisibleSeconds: 1_011_600,
      earthVisibleSeconds: 700_200,
      longestNightSeconds: 86_400,
      stepsCompleted: 2016,
      stepsTotal: 2016,
    },
  },
  {
    id: "run-ap-8445",
    scenarioId: "scn-mlp-014",
    status: "SUCCEEDED",
    progressPercent: 100,
    submittedAtUtc: "2026-02-24T08:05:00Z",
    startedAtUtc: "2026-02-24T08:05:00Z",
    finishedAtUtc: "2026-02-24T08:09:00Z",
    quality: "VALIDATED",
    source: SOURCE,
    error: null,
    summary: {
      sunVisibleSeconds: 1_123_200,
      earthVisibleSeconds: 1_097_600,
      longestNightSeconds: 50_760,
      stepsCompleted: 336,
      stepsTotal: 336,
    },
  },
  {
    id: "run-ap-8446",
    scenarioId: "scn-conn-007",
    status: "SUCCEEDED",
    progressPercent: 100,
    submittedAtUtc: "2026-02-20T11:30:00Z",
    startedAtUtc: "2026-02-20T11:31:00Z",
    finishedAtUtc: "2026-02-20T11:44:00Z",
    quality: "ESTIMATED",
    source: SOURCE,
    error: null,
    summary: {
      sunVisibleSeconds: 1_036_800,
      earthVisibleSeconds: 561_600,
      longestNightSeconds: 88_560,
      stepsCompleted: 672,
      stepsTotal: 672,
    },
  },
  {
    id: "run-ap-8441",
    scenarioId: "scn-fau-003",
    status: "FAILED",
    progressPercent: 42,
    submittedAtUtc: "2026-02-18T14:02:00Z",
    startedAtUtc: "2026-02-18T14:02:00Z",
    finishedAtUtc: "2026-02-18T14:03:00Z",
    quality: "UNCOMPUTABLE",
    source: SOURCE,
    error: {
      code: "DEM_COVERAGE_INSUFFICIENT",
      message:
        "Couverture DEM absente sur 18 % de l'horizon : le calcul des fenêtres de visibilité est interrompu.",
    },
    summary: null,
  },
  {
    id: "run-ap-8447",
    scenarioId: "scn-mlp-014",
    status: "QUEUED",
    progressPercent: 0,
    submittedAtUtc: "2026-03-05T10:12:00Z",
    startedAtUtc: null,
    finishedAtUtc: null,
    quality: "ESTIMATED",
    source: SOURCE,
    error: null,
    summary: null,
  },
  {
    id: "run-ap-8448",
    scenarioId: "scn-conn-007",
    status: "RUNNING",
    progressPercent: 46,
    submittedAtUtc: "2026-03-05T10:10:00Z",
    startedAtUtc: "2026-03-05T10:10:30Z",
    finishedAtUtc: null,
    quality: "ESTIMATED",
    source: SOURCE,
    error: null,
    summary: null,
  },
];

export const REPORTS: Report[] = [
  {
    id: "rpt-2026-031",
    title: "Rapport Artemis III — Shackleton Rim",
    kind: "SCENARIO",
    format: "PDF",
    status: "READY",
    createdAt: "2026-03-02T09:30:00Z",
    scenarioIds: ["scn-art3-001"],
    siteIds: ["site-shk-001"],
    author: "Camille Roux",
    quality: "VALIDATED",
    source: SOURCE,
    sizeBytes: 2_412_544,
  },
  {
    id: "rpt-2026-029",
    title: "Comparatif Malapert / Shackleton",
    kind: "COMPARISON",
    format: "PDF",
    status: "READY",
    createdAt: "2026-02-28T15:05:00Z",
    scenarioIds: ["scn-art3-001", "scn-mlp-014"],
    siteIds: ["site-shk-001", "site-mlp-004"],
    author: "Nadia Belkacem",
    quality: "VALIDATED",
    source: SOURCE,
    sizeBytes: 1_884_160,
  },
  {
    id: "rpt-2026-027",
    title: "Fenêtres de visibilité — export CSV",
    kind: "RUN",
    format: "CSV",
    status: "READY",
    createdAt: "2026-02-24T08:20:00Z",
    scenarioIds: ["scn-mlp-014"],
    siteIds: ["site-mlp-004"],
    author: "Camille Roux",
    quality: "VALIDATED",
    source: SOURCE,
    sizeBytes: 184_320,
  },
  {
    id: "rpt-2026-024",
    title: "Analyse Faustini — échec de couverture DEM",
    kind: "SCENARIO",
    format: "PDF",
    status: "FAILED",
    createdAt: "2026-02-18T14:10:00Z",
    scenarioIds: ["scn-fau-003"],
    siteIds: ["site-fau-001"],
    author: "Nadia Belkacem",
    quality: "LOW",
    source: SOURCE,
    sizeBytes: null,
  },
];

export const DEFAULT_CRITERIA: ComparisonCriterion[] = [
  { key: "illumination", label: "Illumination solaire", weight: 0.35, enabled: true },
  { key: "earthVisibility", label: "Visibilité géométrique Terre", weight: 0.3, enabled: true },
  { key: "nightDuration", label: "Durée de nuit maximale", weight: 0.2, enabled: true },
  { key: "solarElevation", label: "Élévation solaire moyenne", weight: 0.15, enabled: false },
];

export function getSite(idOrSlug: string): SiteDetail | undefined {
  return SITES.find((site) => site.id === idOrSlug || site.slug === idOrSlug);
}

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

export function getRun(id: string): Run | undefined {
  return RUNS.find((run) => run.id === id);
}

const HOUR = 3_600_000;

function clampVisibility(elevation: number): VisibilityClass {
  if (elevation > 0.5) return "FULL";
  if (elevation > -1) return "PARTIAL";
  return "OCCULTED";
}

const SEEDS: Record<string, number> = {
  "site-shk-001": 1.2,
  "site-mlp-004": 2.4,
  "site-crd-002": 0.7,
  "site-fau-001": 3.1,
  "site-amn-002": 2.0,
  "site-lbz-009": 1.6,
  "site-a11-001": 0.2,
  "site-usr-001": 1.4,
};

/** Série temporelle simulée, produite « côté API ». */
export function buildSeries(scenario: Scenario): TimeSeries {
  const site = getSite(scenario.siteId);
  const seed = SEEDS[scenario.siteId] ?? 1;
  const start = new Date(scenario.window.startUtc).getTime();
  const end = new Date(scenario.window.endUtc).getTime();
  const stepMs = scenario.window.stepSeconds * 1000;
  const points: SeriesPoint[] = [];

  for (let time = start; time <= end; time += stepMs) {
    const hours = (time - start) / HOUR;
    const phase = hours / 14;

    const sunElevation =
      (site?.category === "PLATEAU" ? 2.1 : 1.4) +
      3.1 * Math.sin((2 * Math.PI * phase) + seed);
    const sunAzimuth = (140 + hours * 0.48 + seed * 7 + 360) % 360;

    const earthElevation = (site?.referenceState.earth.elevationDeg ?? 4) +
      1.7 * Math.sin((2 * Math.PI * phase) + seed + 1.1);
    const earthAzimuth = (35 + hours * 0.05 + seed * 3 + 360) % 360;

    const horizonElevation = (site?.horizonProfile
      ? site.horizonProfile.samples[
          Math.floor(sunAzimuth / (site.horizonProfile.resolutionDeg || 5)) %
            site.horizonProfile.samples.length
        ]?.elevationDeg
      : 1.2) ?? 1.2;

    points.push({
      atUtc: new Date(time).toISOString(),
      sun: {
        azimuthDeg: Number(sunAzimuth.toFixed(2)),
        elevationDeg: Number(sunElevation.toFixed(2)),
        visibility: clampVisibility(sunElevation),
      },
      earth: {
        azimuthDeg: Number(earthAzimuth.toFixed(2)),
        elevationDeg: Number(earthElevation.toFixed(2)),
        visibility: clampVisibility(earthElevation),
      },
      horizonElevationDeg: horizonElevation,
      solarFluxWm2: sunElevation > 0 ? Math.round(1361 * Math.min(1, 0.55 + sunElevation / 6)) : 0,
    });
  }

  return {
    runId: scenario.lastRunId ?? "run-ap-8444",
    scenarioId: scenario.id,
    startUtc: scenario.window.startUtc,
    endUtc: scenario.window.endUtc,
    stepSeconds: scenario.window.stepSeconds,
    points,
    source: SOURCE,
  };
}

/** Fenêtres de visibilité agrégées, produites « côté API ». */
export function buildVisibilityWindows(
  runId: string,
  series: TimeSeries,
): VisibilityWindow[] {
  const windows: VisibilityWindow[] = [];

  (["SUN", "EARTH"] as const).forEach((body) => {
    let current: { start: string; visibility: VisibilityClass } | null = null;
    let previous: VisibilityClass | null = null;
    let index = 0;

    for (const point of series.points) {
      const visibility = point[body === "SUN" ? "sun" : "earth"].visibility;
      if (!current) {
        current = { start: point.atUtc, visibility };
        previous = visibility;
        continue;
      }
      if (visibility !== previous) {
        const duration =
          (new Date(point.atUtc).getTime() - new Date(current.start).getTime()) / 1000;
        windows.push({
          id: `${runId}-${body.toLowerCase()}-${index++}`,
          runId,
          body,
          startsAtUtc: current.start,
          endsAtUtc: point.atUtc,
          visibility: current.visibility,
          durationSeconds: duration,
          transition: previous === "FULL" ? "EXIT" : visibility === "FULL" ? "ENTER" : "PARTIAL",
        });
        current = { start: point.atUtc, visibility };
        previous = visibility;
      }
    }

    if (current && previous) {
      windows.push({
        id: `${runId}-${body.toLowerCase()}-${index++}`,
        runId,
        body,
        startsAtUtc: current.start,
        endsAtUtc: series.endUtc,
        visibility: current.visibility,
        durationSeconds:
          (new Date(series.endUtc).getTime() - new Date(current.start).getTime()) / 1000,
        transition: "PARTIAL",
      });
    }
  });

  return windows.sort(
    (a, b) => new Date(a.startsAtUtc).getTime() - new Date(b.startsAtUtc).getTime(),
  );
}

function metricsFor(series: TimeSeries): ComparisonMetrics {
  const sunVisible = series.points.filter((p) => p.sun.visibility === "FULL").length;
  const earthVisible = series.points.filter((p) => p.earth.visibility !== "OCCULTED").length;
  const stepHours = series.stepSeconds / 3600;

  let longestNight = 0;
  let currentNight = 0;
  for (const point of series.points) {
    if (point.sun.visibility === "OCCULTED") {
      currentNight += stepHours;
      longestNight = Math.max(longestNight, currentNight);
    } else {
      currentNight = 0;
    }
  }

  const elevations = series.points.map((p) => p.sun.elevationDeg);

  return {
    illuminationHours: Number((sunVisible * stepHours).toFixed(1)),
    illuminationPercent: Number(((sunVisible / series.points.length) * 100).toFixed(1)),
    earthVisibleHours: Number((earthVisible * stepHours).toFixed(1)),
    longestNightHours: Number(longestNight.toFixed(1)),
    averageSolarElevationDeg: Number(
      (elevations.reduce((sum, value) => sum + value, 0) / elevations.length).toFixed(2),
    ),
    minimumSolarElevationDeg: Number(Math.min(...elevations).toFixed(2)),
  };
}

const CONSTRAINT_DEFS: Omit<ComparisonConstraint, "passed" | "value">[] = [
  {
    key: "illumination_min",
    label: "Illumination solaire ≥ 80 %",
    critical: true,
    threshold: "≥ 80 %",
  },
  {
    key: "earth_visibility_min",
    label: "Terre visible ≥ 40 % de la fenêtre",
    critical: true,
    threshold: "≥ 40 %",
  },
  {
    key: "night_max",
    label: "Nuit continue < 48 h",
    critical: false,
    threshold: "< 48 h",
  },
];

/** Comparaison simulée, calculée « côté API ». */
export function buildComparison(
  scenarioIds: string[],
  criteria: ComparisonCriterion[],
  scoreEnabled: boolean,
): Comparison {
  const scenarios = scenarioIds
    .map((id) => getScenario(id))
    .filter((scenario): scenario is Scenario => Boolean(scenario));

  const results = scenarios.map((scenario) => {
    const series = buildSeries(scenario);
    const metrics = metricsFor(series);
    const totalHours = series.points.length * (series.stepSeconds / 3600);
    const earthPercent = (metrics.earthVisibleHours / totalHours) * 100;

    const constraints = CONSTRAINT_DEFS.map((constraint) => {
      let passed = false;
      let value = "";
      if (constraint.key === "illumination_min") {
        passed = metrics.illuminationPercent >= 80;
        value = `${metrics.illuminationPercent.toFixed(1)} %`;
      } else if (constraint.key === "earth_visibility_min") {
        passed = earthPercent >= 40;
        value = `${Math.round(earthPercent)} %`;
      } else {
        passed = metrics.longestNightHours < 48;
        value = `${metrics.longestNightHours.toFixed(1)} h`;
      }
      return { ...constraint, passed, value };
    });

    const enabled = criteria.filter((criterion) => criterion.enabled);
    const weighted = enabled.reduce((sum, criterion) => {
      let normalized = 0;
      if (criterion.key === "illumination") normalized = Math.min(1, metrics.illuminationPercent / 100);
      else if (criterion.key === "earthVisibility") normalized = Math.min(1, earthPercent / 100);
      else if (criterion.key === "nightDuration") normalized = Math.max(0, 1 - metrics.longestNightHours / 100);
      else normalized = Math.max(0, Math.min(1, (metrics.averageSolarElevationDeg + 2) / 8));
      return sum + normalized * criterion.weight;
    }, 0);
    const totalWeight = enabled.reduce((sum, criterion) => sum + criterion.weight, 0) || 1;

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      siteId: scenario.siteId,
      siteName: scenario.siteName,
      metrics,
      sunVisibility: series.points[Math.floor(series.points.length / 3)]?.sun.visibility ?? "UNKNOWN",
      earthVisibility: series.points[Math.floor(series.points.length / 3)]?.earth.visibility ?? "UNKNOWN",
      score: scoreEnabled ? Math.round((weighted / totalWeight) * 100) : null,
      constraints,
      quality: scenario.quality,
    };
  });

  return {
    id: `cmp-${scenarioIds.join("-")}`,
    createdAt: new Date().toISOString(),
    commonWindow: {
      startUtc: "2030-01-01T00:00:00Z",
      endUtc: "2030-01-15T00:00:00Z",
    },
    scenarioIds,
    results,
    criteria,
    constraints: CONSTRAINT_DEFS.map((constraint) => ({
      ...constraint,
      passed: results.every((result) =>
        result.constraints.find((c) => c.key === constraint.key)?.passed ?? false,
      ),
      value: "",
    })),
    scoreEnabled,
    source: SOURCE,
  };
}

export const COMPARISON: Comparison = buildComparison(
  ["scn-art3-001", "scn-mlp-014"],
  DEFAULT_CRITERIA,
  true,
);
