import type { Body, DataSource, VisibilityClass } from "./common";

export interface BodySample {
  azimuthDeg: number;
  elevationDeg: number;
  visibility: VisibilityClass;
}

export interface SeriesPoint {
  atUtc: string;
  sun: BodySample;
  earth: BodySample;
  /** Élévation de l'horizon topographique dans la direction du Soleil. */
  horizonElevationDeg: number;
  solarFluxWm2: number;
}

export interface TimeSeries {
  runId: string;
  scenarioId: string;
  startUtc: string;
  endUtc: string;
  stepSeconds: number;
  points: SeriesPoint[];
  source: DataSource;
}

export type TransitionKind = "ENTER" | "EXIT" | "PARTIAL";

export interface VisibilityWindow {
  id: string;
  runId: string;
  body: Body;
  startsAtUtc: string;
  endsAtUtc: string;
  visibility: VisibilityClass;
  durationSeconds: number;
  transition: TransitionKind;
}
