import type { DataSource, QualityLevel, VisibilityClass } from "./common";

export type CriterionKey =
  | "illumination"
  | "earthVisibility"
  | "nightDuration"
  | "solarElevation";

export interface ComparisonCriterion {
  key: CriterionKey;
  label: string;
  weight: number;
  enabled: boolean;
}

export interface ComparisonConstraint {
  key: string;
  label: string;
  critical: boolean;
  passed: boolean;
  value: string;
  threshold: string;
}

export interface ComparisonMetrics {
  illuminationHours: number;
  illuminationPercent: number;
  earthVisibleHours: number;
  longestNightHours: number;
  averageSolarElevationDeg: number;
  minimumSolarElevationDeg: number;
}

export interface ComparisonScenario {
  scenarioId: string;
  scenarioName: string;
  siteId: string;
  siteName: string;
  metrics: ComparisonMetrics;
  sunVisibility: VisibilityClass;
  earthVisibility: VisibilityClass;
  /** Score optionnel : `null` si le score n'est pas activé. */
  score: number | null;
  constraints: ComparisonConstraint[];
  quality: QualityLevel;
}

export interface Comparison {
  id: string;
  createdAt: string;
  commonWindow: { startUtc: string; endUtc: string };
  scenarioIds: string[];
  results: ComparisonScenario[];
  criteria: ComparisonCriterion[];
  constraints: ComparisonConstraint[];
  scoreEnabled: boolean;
  source: DataSource;
}
