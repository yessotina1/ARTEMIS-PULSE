import { ApiClientError } from "./client";
import type { ArtemisApi, ComparisonRequest } from "./contract";
import {
  COMPARISON,
  DEFAULT_CRITERIA,
  REPORTS,
  RUNS,
  SCENARIOS,
  SITES,
  SOURCE,
  buildComparison,
  buildSeries,
  buildVisibilityWindows,
  getRun,
  getScenario,
  getSite,
} from "./mock-data";
import type { CreateScenarioInput, Run, Scenario, SiteQuery } from "@/types";

/** Latence simulée pour rendre les états de chargement visibles. */
function delay(ms = 320) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let requestCounter = 0;

function fail(code: string, message: string, status = 400): never {
  requestCounter += 1;
  throw new ApiClientError({
    code,
    message,
    requestId: `req_mock_${String(requestCounter).padStart(4, "0")}`,
    status,
  });
}

/** Démarre la simulation d'un run : il progresse à chaque interrogation. */
const runStartedAt = new Map<string, number>();

function simulateRun(run: Run): Run {
  if (run.status !== "QUEUED" && run.status !== "RUNNING") return run;
  const now = Date.now();
  if (!runStartedAt.has(run.id)) runStartedAt.set(run.id, now);
  const elapsed = (now - (runStartedAt.get(run.id) ?? now)) / 1000;

  if (elapsed < 4) {
    return { ...run, status: "QUEUED", progressPercent: 0 };
  }
  if (elapsed < 12) {
    return {
      ...run,
      status: "RUNNING",
      progressPercent: Math.min(95, Math.round(((elapsed - 4) / 8) * 100)),
      startedAtUtc: run.startedAtUtc ?? new Date().toISOString(),
    };
  }

  const scenario = SCENARIOS.find((item) => item.id === run.scenarioId);
  return {
    ...run,
    status: "SUCCEEDED",
    progressPercent: 100,
    startedAtUtc: run.startedAtUtc ?? new Date().toISOString(),
    finishedAtUtc: new Date().toISOString(),
    summary: {
      sunVisibleSeconds: 1_018_800,
      earthVisibleSeconds: 680_400,
      longestNightSeconds: 82_800,
      stepsCompleted: scenario?.window.steps ?? 336,
      stepsTotal: scenario?.window.steps ?? 336,
    },
  };
}

const scenarioStore: Scenario[] = [...SCENARIOS];
const runStore: Run[] = [...RUNS];

export const mockApi: ArtemisApi = {
  sites: {
    async list(query?: SiteQuery) {
      await delay();
      let items = [...SITES];
      if (query?.region === "SOUTH_POLE") {
        items = items.filter((site) => site.coordinates.latitudeDeg < -60);
      }
      if (query?.category && query.category !== "ALL") {
        items = items.filter((site) => site.category === query.category);
      }
      if (query?.demStatus && query.demStatus !== "ALL") {
        items = items.filter((site) => site.dem.status === query.demStatus);
      }
      if (query?.mission) {
        items = items.filter((site) => site.mission === query.mission);
      }
      if (query?.search) {
        const needle = query.search.toLowerCase();
        items = items.filter(
          (site) =>
            site.name.toLowerCase().includes(needle) ||
            site.designation.toLowerCase().includes(needle) ||
            site.tags.some((tag) => tag.toLowerCase().includes(needle)),
        );
      }
      return items.map((site) => ({
        id: site.id,
        slug: site.slug,
        name: site.name,
        designation: site.designation,
        category: site.category,
        mission: site.mission,
        coordinates: site.coordinates,
        quality: site.quality,
        dem: site.dem,
        illuminationPercent: site.illuminationPercent,
        maxContinuousDarknessHours: site.maxContinuousDarknessHours,
        tags: site.tags,
        referenceEphemerisUtc: site.referenceEphemerisUtc,
      }));
    },

    async get(siteId: string) {
      await delay(260);
      const site = getSite(siteId);
      if (!site) fail("SITE_NOT_FOUND", "Ce site n'existe pas dans le catalogue.", 404);
      return site;
    },
  },

  scenarios: {
    async list() {
      await delay();
      return [...scenarioStore].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    },

    async get(scenarioId: string) {
      await delay(240);
      const scenario = scenarioStore.find((item) => item.id === scenarioId);
      if (!scenario) fail("SCENARIO_NOT_FOUND", "Scénario introuvable.", 404);
      return scenario;
    },

    async create(input: CreateScenarioInput) {
      await delay(520);
      const site = getSite(input.siteId);
      if (!site) fail("SITE_NOT_FOUND", "Le site sélectionné est introuvable.", 404);
      const steps = Math.round(
        (new Date(input.window.endUtc).getTime() - new Date(input.window.startUtc).getTime()) /
          1000 /
          input.window.stepSeconds,
      );
      if (steps <= 0) fail("INVALID_WINDOW", "La fenêtre temporelle est vide.");
      if (steps > 20_000) {
        fail(
          "WINDOW_TOO_LARGE",
          "La fenêtre dépasse 20 000 pas de calcul : réduisez la période ou augmentez le pas.",
        );
      }
      const id = `scn-${Date.now().toString(36)}`;
      const scenario: Scenario = {
        id,
        name: input.name,
        siteId: site.id,
        siteName: site.name,
        observer: input.observer,
        window: { ...input.window, steps },
        status: "QUEUED",
        quality: site.quality,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastRunId: null,
        tags: input.tags ?? [],
        notes: input.notes,
        owner: "Camille Roux",
        source: SOURCE,
      };
      const run: Run = {
        id: `run-${Date.now().toString(36)}`,
        scenarioId: id,
        status: "QUEUED",
        progressPercent: 0,
        submittedAtUtc: new Date().toISOString(),
        startedAtUtc: null,
        finishedAtUtc: null,
        quality: site.quality,
        source: SOURCE,
        error: null,
        summary: null,
      };
      scenario.lastRunId = run.id;
      scenarioStore.unshift(scenario);
      runStore.unshift(run);
      return scenario;
    },

    async remove(scenarioId: string) {
      await delay(200);
      const index = scenarioStore.findIndex((item) => item.id === scenarioId);
      if (index === -1) fail("SCENARIO_NOT_FOUND", "Scénario introuvable.", 404);
      scenarioStore.splice(index, 1);
    },
  },

  runs: {
    async get(runId: string) {
      await delay(200);
      const run = runStore.find((item) => item.id === runId);
      if (!run) fail("RUN_NOT_FOUND", "Run introuvable.", 404);
      const simulated = simulateRun(run);
      const index = runStore.findIndex((item) => item.id === runId);
      runStore[index] = simulated;
      return simulated;
    },

    async listForScenario(scenarioId: string) {
      await delay(180);
      return runStore.filter((run) => run.scenarioId === scenarioId);
    },

    async create(scenarioId: string) {
      await delay(300);
      const scenario = scenarioStore.find((item) => item.id === scenarioId);
      if (!scenario) fail("SCENARIO_NOT_FOUND", "Scénario introuvable.", 404);
      const run: Run = {
        id: `run-${Date.now().toString(36)}`,
        scenarioId,
        status: "QUEUED",
        progressPercent: 0,
        submittedAtUtc: new Date().toISOString(),
        startedAtUtc: null,
        finishedAtUtc: null,
        quality: scenario.quality,
        source: SOURCE,
        error: null,
        summary: null,
      };
      runStore.unshift(run);
      scenario.lastRunId = run.id;
      scenario.status = "QUEUED";
      return run;
    },

    async series(runId: string) {
      await delay(340);
      const run = runStore.find((item) => item.id === runId);
      if (!run) fail("RUN_NOT_FOUND", "Run introuvable.", 404);
      const scenario = scenarioStore.find((item) => item.id === run.scenarioId);
      if (!scenario) fail("SCENARIO_NOT_FOUND", "Scénario introuvable.", 404);
      if (run.status !== "SUCCEEDED") {
        fail(
          "RUN_NOT_READY",
          "La série temporelle n'est disponible qu'une fois le run terminé.",
          409,
        );
      }
      return buildSeries({ ...scenario, lastRunId: run.id });
    },

    async visibilityWindows(runId: string) {
      await delay(280);
      const run = runStore.find((item) => item.id === runId);
      if (!run) fail("RUN_NOT_FOUND", "Run introuvable.", 404);
      const scenario = scenarioStore.find((item) => item.id === run.scenarioId);
      if (!scenario) fail("SCENARIO_NOT_FOUND", "Scénario introuvable.", 404);
      if (run.status !== "SUCCEEDED") {
        fail("RUN_NOT_READY", "Le run n'est pas terminé.", 409);
      }
      return buildVisibilityWindows(run.id, buildSeries({ ...scenario, lastRunId: run.id }));
    },
  },

  comparisons: {
    async create(input: ComparisonRequest) {
      await delay(460);
      if (input.scenarioIds.length < 2 || input.scenarioIds.length > 4) {
        fail("INVALID_COMPARISON_SIZE", "Sélectionnez entre 2 et 4 scénarios.");
      }
      const missing = input.scenarioIds.filter((id) => !getScenario(id));
      if (missing.length > 0) fail("SCENARIO_NOT_FOUND", "Un scénario sélectionné est introuvable.", 404);
      return buildComparison(
        input.scenarioIds,
        input.criteria ?? DEFAULT_CRITERIA,
        input.scoreEnabled ?? true,
      );
    },

    async list() {
      await delay(240);
      return [COMPARISON];
    },
  },

  reports: {
    async list() {
      await delay(260);
      return [...REPORTS];
    },
  },
};

export function findMockRun(runId: string): Run | undefined {
  return getRun(runId);
}
