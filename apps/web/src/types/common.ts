import type { QualityLevel } from "./enums";

export type { QualityLevel, VisibilityClass } from "./enums";

/** Provenance affichée sur chaque résultat (source + version des données). */
export interface DataSource {
  source: string;
  version: string;
  model?: string;
}

/** Erreur structurée renvoyée par l'API. */
export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown> | string[];
  requestId: string;
}

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface ListResponse<T> {
  items: T[];
  meta?: PageMeta;
}

export interface BodyGeometry {
  azimuthDeg: number;
  elevationDeg: number;
}

export type Body = "SUN" | "EARTH";

/** État de référence d'un site (affichage instantané, calculé côté API). */
export interface ReferenceState {
  atUtc: string;
  sun: BodyGeometry;
  earth: BodyGeometry;
  sunVisibility: import("./enums").VisibilityClass;
  earthVisibility: import("./enums").VisibilityClass;
  solarFluxWm2: number;
  quality: QualityLevel;
  source: DataSource;
}
