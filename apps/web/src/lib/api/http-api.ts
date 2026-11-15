import { http } from "./client";
import type { ArtemisApi } from "./contract";
import type {
  Comparison,
  CreateScenarioInput,
  ListResponse,
  Report,
  Run,
  Scenario,
  SiteDetail,
  SiteQuery,
  SiteSummary,
  TimeSeries,
  VisibilityWindow,
} from "@/types";

function queryString(query?: SiteQuery): string {
  if (!query) return "";
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value && value !== "ALL") params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

/** Implémentation HTTP réelle (branchée quand NEXT_PUBLIC_USE_MOCKS=false). */
export const httpApi: ArtemisApi = {
  sites: {
    list: (query) =>
      http
        .get<ListResponse<SiteSummary> | SiteSummary[]>(`/sites${queryString(query)}`)
        .then((response) => (Array.isArray(response) ? response : response.items)),
    get: (siteId) => http.get<SiteDetail>(`/sites/${siteId}`),
  },
  scenarios: {
    list: () =>
      http
        .get<ListResponse<Scenario> | Scenario[]>("/scenarios")
        .then((response) => (Array.isArray(response) ? response : response.items)),
    get: (scenarioId) => http.get<Scenario>(`/scenarios/${scenarioId}`),
    create: (input: CreateScenarioInput) => http.post<Scenario>("/scenarios", input),
    remove: (scenarioId) => http.delete<void>(`/scenarios/${scenarioId}`),
  },
  runs: {
    get: (runId) => http.get<Run>(`/runs/${runId}`),
    listForScenario: (scenarioId) =>
      http
        .get<ListResponse<Run> | Run[]>(`/scenarios/${scenarioId}/runs`)
        .then((response) => (Array.isArray(response) ? response : response.items)),
    create: (scenarioId) => http.post<Run>(`/scenarios/${scenarioId}/runs`, {}),
    series: (runId) => http.get<TimeSeries>(`/runs/${runId}/series`),
    visibilityWindows: (runId) =>
      http
        .get<ListResponse<VisibilityWindow> | VisibilityWindow[]>(
          `/runs/${runId}/visibility-windows`,
        )
        .then((response) => (Array.isArray(response) ? response : response.items)),
  },
  comparisons: {
    create: (input) => http.post<Comparison>("/comparisons", input),
    list: () =>
      http
        .get<ListResponse<Comparison> | Comparison[]>("/comparisons")
        .then((response) => (Array.isArray(response) ? response : response.items)),
  },
  reports: {
    list: () => http.get<Report[]>("/reports"),
  },
};
