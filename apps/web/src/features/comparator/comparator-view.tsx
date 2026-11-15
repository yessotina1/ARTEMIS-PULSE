"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueries } from "@tanstack/react-query";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  QualityBadge,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { api, DEFAULT_CRITERIA } from "@/lib/api";
import { useComparison, useScenarios } from "@/hooks";
import { queryKeys } from "@/hooks";
import { formatAxisTick, formatElevation, formatPercent, formatUtc } from "@/lib/format";
import type { Comparison, ComparisonCriterion, Scenario, TimeSeries } from "@/types";
import { cn } from "@/lib/cn";

const LINE_COLORS = ["#4cd7f6", "#adc6ff", "#4edea3", "#f59e0b"];
const MAX_SCENARIOS = 4;

export function ComparatorView({ initialScenarioIds = [] }: { initialScenarioIds?: string[] }) {
  const scenariosQuery = useScenarios();
  const scenarios = useMemo(() => scenariosQuery.data ?? [], [scenariosQuery.data]);

  const [selectedIds, setSelectedIds] = useState<string[]>(initialScenarioIds);
  const [scoreEnabled, setScoreEnabled] = useState(true);
  const [criteria, setCriteria] = useState<ComparisonCriterion[]>(DEFAULT_CRITERIA);

  const effectiveIds = useMemo(() => {
    const ready = scenarios.filter((scenario) => scenario.lastRunId);
    const fromInitial = initialScenarioIds.filter((id) => ready.some((s) => s.id === id));
    if (selectedIds.length > 0) return selectedIds;
    return fromInitial.length >= 2 ? fromInitial : ready.slice(0, 2).map((s) => s.id);
  }, [initialScenarioIds, scenarios, selectedIds]);

  const request = useMemo(
    () =>
      effectiveIds.length >= 2
        ? { scenarioIds: effectiveIds, criteria, scoreEnabled }
        : null,
    [effectiveIds, criteria, scoreEnabled],
  );

  const comparisonQuery = useComparison(request);

  const selectedScenarios = scenarios.filter((scenario) => effectiveIds.includes(scenario.id));
  const seriesQueries = useQueries({
    queries: selectedScenarios.map((scenario) => ({
      queryKey: queryKeys.series(scenario.lastRunId ?? "none"),
      queryFn: () => api.runs.series(scenario.lastRunId as string),
      enabled: Boolean(scenario.lastRunId),
      staleTime: 60_000,
    })),
  });

  function toggleScenario(scenario: Scenario) {
    setSelectedIds((current) => {
      const base = current.length > 0 ? current : effectiveIds;
      if (base.includes(scenario.id)) {
        return base.length <= 2 ? base : base.filter((id) => id !== scenario.id);
      }
      if (base.length >= MAX_SCENARIOS) return base;
      return [...base, scenario.id];
    });
  }

  function updateWeight(key: ComparisonCriterion["key"], weight: number) {
    setCriteria((current) =>
      current.map((criterion) =>
        criterion.key === key ? { ...criterion, weight } : criterion,
      ),
    );
  }

  if (scenariosQuery.isPending) return <LoadingState label="Chargement des scénarios…" rows={4} />;
  if (scenariosQuery.isError) {
    return (
      <ErrorState
        message={scenariosQuery.error instanceof Error ? scenariosQuery.error.message : undefined}
        onRetry={() => void scenariosQuery.refetch()}
      />
    );
  }

  const comparison = comparisonQuery.data;
  const series = seriesQueries
    .map((query) => query.data)
    .filter((value): value is TimeSeries => Boolean(value));
  const totalWeight = criteria
    .filter((criterion) => criterion.enabled)
    .reduce((sum, criterion) => sum + criterion.weight, 0);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader
            eyebrow="Sélection"
            title={`Comparer ${effectiveIds.length} scénarios (2 à 4)`}
            icon={<Icon name="sliders" size={16} />}
            actions={<Badge tone={effectiveIds.length >= 2 ? "success" : "warning"}>{effectiveIds.length} sélectionnés</Badge>}
          />
          <CardBody>
            <ul className="grid gap-1 md:grid-cols-2">
              {scenarios.map((scenario) => {
                const active = effectiveIds.includes(scenario.id);
                const disabled = !scenario.lastRunId;
                return (
                  <li key={scenario.id}>
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-2 rounded border px-2 py-1",
                        active
                          ? "border-primary/60 bg-primary/10"
                          : "border-grid hover:border-outline-variant",
                        disabled && "cursor-not-allowed opacity-60",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        disabled={disabled}
                        onChange={() => toggleScenario(scenario)}
                        className="mt-1 accent-primary"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-1">
                          <span className="text-body-md">{scenario.name}</span>
                          <QualityBadge value={scenario.quality} />
                        </span>
                        <span className="block font-mono text-label-sm text-on-surface-variant">
                          {scenario.siteName} · {scenario.window.steps} pas
                        </span>
                        {disabled ? (
                          <span className="block text-body-sm text-quality-low">
                            Aucun run terminé — comparaison impossible.
                          </span>
                        ) : null}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            {effectiveIds.length < 2 ? (
              <p className="mt-2 text-body-sm text-quality-low">
                Sélectionnez au moins deux scénarios disposant d&apos;un run terminé.
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Score optionnel"
            title="Critères pondérables"
            icon={<Icon name="target" size={16} />}
            actions={
              <label className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant">
                <input
                  type="checkbox"
                  checked={scoreEnabled}
                  onChange={(event) => setScoreEnabled(event.target.checked)}
                  className="accent-primary"
                />
                Activer
              </label>
            }
          />
          <CardBody className="space-y-2">
            {criteria.map((criterion) => (
              <div key={criterion.key} className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <label
                    htmlFor={`weight-${criterion.key}`}
                    className="flex items-center gap-1 text-body-sm"
                  >
                    <input
                      type="checkbox"
                      checked={criterion.enabled}
                      onChange={() =>
                        setCriteria((current) =>
                          current.map((item) =>
                            item.key === criterion.key
                              ? { ...item, enabled: !item.enabled }
                              : item,
                          ),
                        )
                      }
                      className="accent-primary"
                    />
                    {criterion.label}
                  </label>
                  <span className="font-mono text-label-sm tabular text-on-surface-variant">
                    {Math.round(criterion.weight * 100)} %
                  </span>
                </div>
                <input
                  id={`weight-${criterion.key}`}
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(criterion.weight * 100)}
                  disabled={!criterion.enabled || !scoreEnabled}
                  onChange={(event) =>
                    updateWeight(criterion.key, Number(event.target.value) / 100)
                  }
                  className="w-full accent-[#4cd7f6] disabled:opacity-50"
                  aria-label={`Poids du critère ${criterion.label}`}
                />
              </div>
            ))}
            <p className="border-t border-outline-variant pt-1 font-mono text-label-sm text-on-surface-variant">
              Total des poids actifs : {Math.round(totalWeight * 100)} % (normalisé par l&apos;API).
            </p>
            {!scoreEnabled ? (
              <p className="text-body-sm text-on-surface-variant">
                Score désactivé : seules les métriques et contraintes sont affichées.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      {comparisonQuery.isPending && request ? (
        <LoadingState label="Comparaison en cours…" rows={4} />
      ) : null}

      {comparisonQuery.isError ? (
        <ErrorState
          title="Comparaison impossible"
          message={comparisonQuery.error.message}
          onRetry={() => void comparisonQuery.refetch()}
        />
      ) : null}

      {!request ? (
        <EmptyState
          title="Sélectionnez 2 à 4 scénarios"
          description="Les scénarios sans run terminé ne peuvent pas être comparés."
          action={
            <Link href="/scenarios">
              <Button variant="secondary">Voir mes scénarios</Button>
            </Link>
          }
        />
      ) : null}

      {comparison ? (
        <>
          <ComparisonTable comparison={comparison} />

          <CurvesCard scenarios={selectedScenarios} series={series} commonWindow={comparison.commonWindow} />

          <div className="grid gap-3 lg:grid-cols-2">
            <ConstraintsCard comparison={comparison} critical />
            <ConstraintsCard comparison={comparison} critical={false} />
          </div>

          <AssumptionBanner
            model={comparison.source.model}
            source={comparison.source.source}
            version={comparison.source.version}
            href="/documentation"
          />
        </>
      ) : null}
    </div>
  );
}

function ComparisonTable({ comparison }: { comparison: Comparison }) {
  const rows: { label: string; unit?: string; render: (value: Comparison["results"][number]) => string }[] = [
    { label: "Illumination cumulée", render: (value) => `${value.metrics.illuminationHours.toFixed(1)} h` },
    { label: "Part d'illumination", render: (value) => formatPercent(value.metrics.illuminationPercent, 1) },
    { label: "Terre visible (cumul)", render: (value) => `${value.metrics.earthVisibleHours.toFixed(1)} h` },
    { label: "Nuit continue max.", render: (value) => `${value.metrics.longestNightHours.toFixed(1)} h` },
    { label: "Élévation solaire moyenne", render: (value) => formatElevation(value.metrics.averageSolarElevationDeg) },
    { label: "Élévation solaire minimale", render: (value) => formatElevation(value.metrics.minimumSolarElevationDeg) },
  ];

  return (
    <Card>
      <CardHeader
        eyebrow="Synthèse du delta opérationnel"
        title="Tableau comparatif"
        icon={<Icon name="chart" size={16} />}
        actions={<Timestamp value={comparison.createdAt} />}
      />
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">Comparaison des scénarios sélectionnés</caption>
          <thead>
            <tr className="border-b border-outline-variant">
              <th scope="col" className="px-3 py-1 font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                Métrique
              </th>
              {comparison.results.map((result, index) => (
                <th key={result.scenarioId} scope="col" className="px-3 py-1 align-top">
                  <span className="flex items-center gap-1">
                    <span
                      aria-hidden
                      className="size-2 rounded-full"
                      style={{ backgroundColor: LINE_COLORS[index % LINE_COLORS.length] }}
                    />
                    <span className="text-body-md text-on-surface">{result.siteName}</span>
                  </span>
                  <span className="block font-mono text-label-sm text-on-surface-variant">
                    {result.scenarioName}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <QualityBadge value={result.quality} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-outline-variant/50">
                <th scope="row" className="px-3 py-1 text-left text-body-sm font-normal text-on-surface-variant">
                  {row.label}
                </th>
                {comparison.results.map((result) => (
                  <td key={result.scenarioId} className="px-3 py-1 font-mono text-label-md tabular text-on-surface">
                    {row.render(result)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-outline-variant/50">
              <th scope="row" className="px-3 py-1 text-left text-body-sm font-normal text-on-surface-variant">
                Visibilité Soleil / Terre
              </th>
              {comparison.results.map((result) => (
                <td key={result.scenarioId} className="px-3 py-1">
                  <div className="flex flex-wrap gap-1">
                    <VisibilityBadge value={result.sunVisibility} variant="compact" />
                    <VisibilityBadge value={result.earthVisibility} variant="compact" />
                  </div>
                </td>
              ))}
            </tr>
            {comparison.scoreEnabled ? (
              <tr>
                <th scope="row" className="px-3 py-1 text-left text-body-sm text-on-surface">
                  Score pondéré <span className="text-on-surface-variant">(optionnel)</span>
                </th>
                {comparison.results.map((result) => (
                  <td key={result.scenarioId} className="px-3 py-1">
                    <span className="font-mono text-data-display tabular text-tertiary">
                      {result.score ?? "—"}
                    </span>
                    <span className="ml-1 font-mono text-label-sm text-on-surface-variant">/100</span>
                  </td>
                ))}
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CurvesCard({
  scenarios,
  series,
  commonWindow,
}: {
  scenarios: Scenario[];
  series: TimeSeries[];
  commonWindow: { startUtc: string; endUtc: string };
}) {
  const axisMode: "time" | "date" =
    new Date(commonWindow.endUtc).getTime() - new Date(commonWindow.startUtc).getTime() >
    30 * 3_600_000
      ? "date"
      : "time";

  const chartData = useMemo(() => {
    if (series.length === 0) return [];
    const maxPoints = Math.max(...series.map((item) => item.points.length));
    const stride = Math.max(1, Math.ceil(maxPoints / 220));
    const rows = [];
    for (let index = 0; index < maxPoints; index += stride) {
      const row: Record<string, string | number | null> = {
        atUtc: series[0].points[index]?.atUtc ?? "",
      };
      series.forEach((item, seriesIndex) => {
        row[`s${seriesIndex}`] = item.points[index]?.sun.elevationDeg ?? null;
      });
      rows.push(row);
    }
    return rows;
  }, [series]);

  if (series.length === 0) {
    return (
      <Card>
        <CardHeader eyebrow="Courbes alignées" title="Ensoleillement comparé" icon={<Icon name="chart" size={16} />} />
        <CardBody>
          <LoadingState label="Chargement des séries temporelles…" rows={2} />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        eyebrow="Courbes alignées sur la fenêtre commune"
        title="Élévation solaire comparée"
        icon={<Icon name="chart" size={16} />}
        actions={<Badge tone="neutral">Pas de temps normalisé</Badge>}
      />
      <CardBody>
        <div className="h-64 w-full" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#274060" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="atUtc"
                tickFormatter={(value: string) => formatAxisTick(String(value), axisMode)}
                stroke="#869397"
                tick={{ fill: "#bcc9cd", fontSize: 12 }}
                minTickGap={48}
              />
              <YAxis
                stroke="#869397"
                tick={{ fill: "#bcc9cd", fontSize: 12 }}
                tickFormatter={(value: number) => `${value.toFixed(0)}°`}
                domain={[-6, 8]}
              />
              <Tooltip
                contentStyle={{
                  background: "#1c283d",
                  border: "1px solid #4cd7f6",
                  borderRadius: 4,
                  fontFamily: "monospace",
                  fontSize: 12,
                }}
                labelFormatter={(label) => (typeof label === "string" ? formatUtc(label) : "")}
                formatter={(value) =>
                  typeof value === "number" ? `${value.toFixed(2)}°` : String(value ?? "—")
                }
              />
              <Legend
                formatter={(value) => {
                  const index = Number(String(value).replace("s", ""));
                  return scenarios[index]?.siteName ?? `Scénario ${index + 1}`;
                }}
                wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }}
              />
              {series.map((_, index) => (
                <Line
                  key={`s${index}`}
                  type="monotone"
                  dataKey={`s${index}`}
                  stroke={LINE_COLORS[index % LINE_COLORS.length]}
                  strokeWidth={1.8}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
          Fenêtre commune : {formatUtc(commonWindow.startUtc)} → {formatUtc(commonWindow.endUtc)}.
          Les séries sont alignées sur le début de la fenêtre commune ; les points hors fenêtre ne
          sont pas extrapolés.
        </p>
      </CardBody>
    </Card>
  );
}

function ConstraintsCard({ comparison, critical }: { comparison: Comparison; critical: boolean }) {
  const constraints = comparison.results[0]?.constraints.filter((item) => item.critical === critical) ?? [];

  return (
    <Card accent={critical ? "occulted" : "partial"}>
      <CardHeader
        eyebrow={critical ? "Bloquantes" : "Confort"}
        title={critical ? "Contraintes critiques" : "Contraintes non critiques"}
        icon={<Icon name={critical ? "alert-triangle" : "info"} size={16} />}
      />
      <CardBody>
        {constraints.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Aucune contrainte de ce type.</p>
        ) : (
          <div className="space-y-2">
            {constraints.map((constraint) => (
              <div key={constraint.key} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <p className="text-body-sm text-on-surface">{constraint.label}</p>
                  <span className="font-mono text-label-sm text-on-surface-variant">
                    seuil {constraint.threshold}
                  </span>
                </div>
                <ul className="grid gap-1 sm:grid-cols-2">
                  {comparison.results.map((result) => {
                    const value = result.constraints.find((item) => item.key === constraint.key);
                    return (
                      <li
                        key={result.scenarioId}
                        className="flex items-center justify-between gap-1 rounded border border-outline-variant/60 px-1 py-0.5"
                      >
                        <span className="truncate text-body-sm text-on-surface-variant">
                          {result.siteName}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-label-sm">
                          <Icon
                            name={value?.passed ? "check-circle" : "minus-circle"}
                            size={13}
                            className={value?.passed ? "text-tertiary" : "text-error"}
                          />
                          {value?.value ?? "—"}
                          <span className="sr-only">{value?.passed ? "respectée" : "non respectée"}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
