import type { DataSource, QualityLevel } from "./common";

export type ReportKind = "SCENARIO" | "COMPARISON" | "SITE" | "RUN";

export type ReportStatus = "READY" | "GENERATING" | "FAILED";

export type ReportFormat = "PDF" | "CSV" | "JSON";

export interface Report {
  id: string;
  title: string;
  kind: ReportKind;
  format: ReportFormat;
  status: ReportStatus;
  createdAt: string;
  scenarioIds: string[];
  siteIds: string[];
  author: string;
  quality: QualityLevel;
  source: DataSource;
  sizeBytes: number | null;
}
