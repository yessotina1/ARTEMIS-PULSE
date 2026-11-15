import type { DataSource, QualityLevel } from "./common";

export type UserProfileKind = "PLANNER" | "EDUCATOR" | "EXPLORER";

export type ScenarioStatus = "DRAFT" | "QUEUED" | "RUNNING" | "READY" | "FAILED";

export interface ObserverDefinition {
  name: string;
  heightM: number;
  mode: "SITE_SURFACE" | "ZENITH";
}

export interface ScenarioWindow {
  startUtc: string;
  endUtc: string;
  stepSeconds: number;
  /** Nombre de pas de calcul, affiché avant lancement. */
  steps: number;
}

export interface Scenario {
  id: string;
  name: string;
  siteId: string;
  siteName: string;
  observer: ObserverDefinition;
  window: ScenarioWindow;
  status: ScenarioStatus;
  quality: QualityLevel;
  createdAt: string;
  updatedAt: string;
  lastRunId: string | null;
  tags: string[];
  notes?: string;
  owner?: string;
  source: DataSource;
}

export interface CreateScenarioInput {
  name: string;
  siteId: string;
  observer: ObserverDefinition;
  window: Omit<ScenarioWindow, "steps">;
  tags?: string[];
  notes?: string;
}
