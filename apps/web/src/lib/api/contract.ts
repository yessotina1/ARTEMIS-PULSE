import type {
  Comparison,
  ComparisonCriterion,
  CreateScenarioInput,
  Report,
  Run,
  Scenario,
  SiteDetail,
  SiteQuery,
  SiteSummary,
  TimeSeries,
  VisibilityWindow,
} from "@/types";

export interface ComparisonRequest {
  scenarioIds: string[];
  criteria?: ComparisonCriterion[];
  scoreEnabled?: boolean;
}

/**
 * Contrat de l'API ARTEMIS PULSE (front uniquement).
 * Les routes sont supposées exposées sous /api/v1.
 */
export interface ArtemisApi {
  sites: {
    list(query?: SiteQuery): Promise<SiteSummary[]>;
    get(siteId: string): Promise<SiteDetail>;
  };
  scenarios: {
    list(): Promise<Scenario[]>;
    get(scenarioId: string): Promise<Scenario>;
    create(input: CreateScenarioInput): Promise<Scenario>;
    remove(scenarioId: string): Promise<void>;
  };
  runs: {
    get(runId: string): Promise<Run>;
    list(): Promise<Run[]>;
    listForScenario(scenarioId: string): Promise<Run[]>;
    create(scenarioId: string): Promise<Run>;
    series(runId: string): Promise<TimeSeries>;
    visibilityWindows(runId: string): Promise<VisibilityWindow[]>;
  };
  comparisons: {
    create(input: ComparisonRequest): Promise<Comparison>;
    list(): Promise<Comparison[]>;
  };
  reports: {
    list(): Promise<Report[]>;
  };
}
