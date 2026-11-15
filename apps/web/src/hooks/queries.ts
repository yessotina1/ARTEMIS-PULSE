"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ComparisonRequest } from "@/lib/api";
import type {
  Comparison,
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

export const queryKeys = {
  sites: (query?: SiteQuery) => ["sites", query ?? {}] as const,
  site: (siteId: string) => ["site", siteId] as const,
  scenarios: () => ["scenarios"] as const,
  scenario: (scenarioId: string) => ["scenario", scenarioId] as const,
  runs: () => ["runs"] as const,
  scenarioRuns: (scenarioId: string) => ["scenario", scenarioId, "runs"] as const,
  run: (runId: string) => ["run", runId] as const,
  series: (runId: string) => ["run", runId, "series"] as const,
  windows: (runId: string) => ["run", runId, "windows"] as const,
  comparison: (request: ComparisonRequest) => ["comparison", request] as const,
  reports: () => ["reports"] as const,
};

export function useSites(query?: SiteQuery): UseQueryResult<SiteSummary[]> {
  return useQuery({
    queryKey: queryKeys.sites(query),
    queryFn: () => api.sites.list(query),
  });
}

export function useSite(siteId: string): UseQueryResult<SiteDetail> {
  return useQuery({
    queryKey: queryKeys.site(siteId),
    queryFn: () => api.sites.get(siteId),
    enabled: Boolean(siteId),
  });
}

export function useScenarios(): UseQueryResult<Scenario[]> {
  return useQuery({ queryKey: queryKeys.scenarios(), queryFn: () => api.scenarios.list() });
}

export function useScenario(scenarioId: string): UseQueryResult<Scenario> {
  return useQuery({
    queryKey: queryKeys.scenario(scenarioId),
    queryFn: () => api.scenarios.get(scenarioId),
    enabled: Boolean(scenarioId),
  });
}

export function useScenarioRuns(scenarioId: string): UseQueryResult<Run[]> {
  return useQuery({
    queryKey: queryKeys.scenarioRuns(scenarioId),
    queryFn: () => api.runs.listForScenario(scenarioId),
    enabled: Boolean(scenarioId),
  });
}

export function useCreateScenario(): UseMutationResult<Scenario, Error, CreateScenarioInput> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateScenarioInput) => api.scenarios.create(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenarios() });
    },
  });
}

export function useRuns(): UseQueryResult<Run[]> {
  return useQuery({ queryKey: queryKeys.runs(), queryFn: () => api.runs.list() });
}

/** Polling tant que le run est QUEUED / RUNNING. */
export function useRun(runId: string | null): UseQueryResult<Run> {
  return useQuery({
    queryKey: queryKeys.run(runId ?? "none"),
    queryFn: () => api.runs.get(runId as string),
    enabled: Boolean(runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "QUEUED" || status === "RUNNING" ? 2000 : false;
    },
  });
}

export function useCreateRun(): UseMutationResult<Run, Error, string> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scenarioId: string) => api.runs.create(scenarioId),
    onSuccess: (run) => {
      queryClient.setQueryData(queryKeys.run(run.id), run);
    },
  });
}

export function useRunSeries(runId: string | null, enabled = true): UseQueryResult<TimeSeries> {
  return useQuery({
    queryKey: queryKeys.series(runId ?? "none"),
    queryFn: () => api.runs.series(runId as string),
    enabled: Boolean(runId) && enabled,
  });
}

export function useVisibilityWindows(
  runId: string | null,
  enabled = true,
): UseQueryResult<VisibilityWindow[]> {
  return useQuery({
    queryKey: queryKeys.windows(runId ?? "none"),
    queryFn: () => api.runs.visibilityWindows(runId as string),
    enabled: Boolean(runId) && enabled,
  });
}

export function useComparison(
  request: ComparisonRequest | null,
): UseQueryResult<Comparison> {
  return useQuery({
    queryKey: queryKeys.comparison(request ?? { scenarioIds: [] }),
    queryFn: () => api.comparisons.create(request as ComparisonRequest),
    enabled: Boolean(request && request.scenarioIds.length >= 2),
    staleTime: 30_000,
  });
}

export function useReports(): UseQueryResult<Report[]> {
  return useQuery({ queryKey: queryKeys.reports(), queryFn: () => api.reports.list() });
}
