import type { DataSource, QualityLevel, ReferenceState } from "./common";

export type SiteCategory = "RIDGE" | "PLATEAU" | "CRATER_RIM" | "PSR" | "HISTORIC" | "CUSTOM";

export type DemCoverageStatus = "FULL" | "PARTIAL" | "NONE";

export interface LunarCoordinates {
  latitudeDeg: number;
  longitudeDeg: number;
  altitudeM: number;
}

/** Couverture du modèle numérique de terrain — avertissement si absente/partielle. */
export interface DemCoverage {
  status: DemCoverageStatus;
  resolutionM: number | null;
  source: string | null;
  note?: string;
}

export interface HorizonSample {
  azimuthDeg: number;
  elevationDeg: number;
}

export interface HorizonProfile {
  samples: HorizonSample[];
  resolutionDeg: number;
  source: DataSource;
}

export interface SiteSummary {
  id: string;
  slug: string;
  name: string;
  designation: string;
  category: SiteCategory;
  mission: string;
  coordinates: LunarCoordinates;
  quality: QualityLevel;
  dem: DemCoverage;
  /** Moyenne sur la fenêtre de référence de 14 jours. */
  illuminationPercent: number | null;
  maxContinuousDarknessHours: number | null;
  tags: string[];
  referenceEphemerisUtc: string;
}

export interface SiteDetail extends SiteSummary {
  description: string;
  referenceState: ReferenceState;
  horizonProfile: HorizonProfile | null;
  /** Scène du site : URL d'image statique fournie par l'API. */
  sceneImageUrl: string | null;
  illustrationUrl: string | null;
}

export type SiteListResponse = { items: SiteSummary[] };

export interface SiteQuery {
  search?: string;
  category?: SiteCategory | "ALL";
  demStatus?: DemCoverageStatus | "ALL";
  mission?: string;
  region?: "SOUTH_POLE" | "ALL";
}
