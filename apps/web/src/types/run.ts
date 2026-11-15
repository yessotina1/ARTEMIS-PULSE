import type { DataSource, QualityLevel } from "./common";

export type RunStatus = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED";

export interface RunFailure {
  code: string;
  message: string;
}

export interface Run {
  id: string;
  scenarioId: string;
  status: RunStatus;
  progressPercent: number;
  submittedAtUtc: string;
  startedAtUtc: string | null;
  finishedAtUtc: string | null;
  quality: QualityLevel;
  source: DataSource;
  error: RunFailure | null;
  /** Synthèse calculée côté API, jamais par le front. */
  summary: {
    sunVisibleSeconds: number;
    earthVisibleSeconds: number;
    longestNightSeconds: number;
    stepsCompleted: number;
    stepsTotal: number;
  } | null;
}
