"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  ErrorState,
  Icon,
  LoadingState,
  Metric,
  QualityBadge,
  RunStatusBadge,
  Tabs,
  TabsPanel,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { HorizonProfileChart } from "@/components/lunar/horizon-profile";
import { SiteScene } from "@/components/lunar/site-scene";
import { useRun, useRunSeries, useScenario, useSite, useVisibilityWindows } from "@/hooks";
import { formatDegrees, formatDuration, formatElevation, formatUtc } from "@/lib/format";
import type { Run, TimeSeries, VisibilityWindow } from "@/types";
import { ScenarioTimeline } from "./timeline";

function ProgressCard({ run }: { run: Run }) {
  return (
    <Card accent="primary" role="status" aria-live="polite">
      <CardHeader
        eyebrow={`Run ${run.id}`}
        title={run.status === "QUEUED" ? "En file de calcul" : "Calcul en cours"}
        icon={<Icon name="spark" size={16} />}
        actions={<RunStatusBadge status={run.status} />}
      />
      <CardBody className="space-y-2">
        <div
          className="h-2 w-full overflow-hidden rounded-sm bg-container-highest"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={run.progressPercent}
          aria-label="Progression du calcul"
        >
          <div
            className="h-full bg-primary transition-[width] duration-500"
            style={{ width: `${run.progressPercent}%` }}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-label-md text-on-surface-variant">
          <span>{run.progressPercent} %</span>
          {run.summary ? (
            <span>
              {run.summary.stepsCompleted} / {run.summary.stepsTotal} pas
            </span>
          ) : null}
          <Timestamp value={run.submittedAtUtc} />
        </div>
        <p className="text-body-sm text-on-surface-variant">
          Le statut est interrogé automatiquement toutes les 2 secondes. Aucun résultat partiel
          n&apos;est affiché avant la fin du calcul.
        </p>
      </CardBody>
    </Card>
  );
}

export function AnalysisView({ runId }: { runId: string }) {
  const runQuery = useRun(runId);
  const run = runQuery.data;
  const scenarioQuery = useScenario(run?.scenarioId ?? "");
  const scenario = scenarioQuery.data;
  const siteQuery = useSite(scenario?.siteId ?? "");
  const site = siteQuery.data;

  const succeeded = run?.status === "SUCCEEDED";
  const seriesQuery = useRunSeries(runId, Boolean(succeeded));
  const windowsQuery = useVisibilityWindows(runId, Boolean(succeeded));
  const series = seriesQuery.data;
  const windows = windowsQuery.data ?? [];

  const [tab, setTab] = useState("combine");
  const [cursor, setCursor] = useState<number | null>(null);
  const cursorIndex = series
    ? (cursor ?? Math.floor(series.points.length / 3))
    : 0;
  const point = series?.points[Math.min(cursorIndex, series.points.length - 1)];

  if (runQuery.isPending) return <LoadingState label="Chargement du run…" rows={5} />;
  if (runQuery.isError) {
    return (
      <ErrorState
        title="Run introuvable"
        message={runQuery.error.message}
        onRetry={() => void runQuery.refetch()}
      />
    );
  }
  if (!run) return null;

  if (run.status === "QUEUED" || run.status === "RUNNING") {
    return (
      <div className="space-y-3">
        <ProgressCard run={run} />
        {scenario ? (
          <Card>
            <CardHeader eyebrow="Scénario" title={scenario.name} icon={<Icon name="file" size={16} />} />
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <Metric label="Site" value={scenario.siteName} />
              <Metric label="Début UTC" value={formatUtc(scenario.window.startUtc)} />
              <Metric label="Pas de calcul" value={scenario.window.steps} />
            </CardBody>
          </Card>
        ) : null}
        <AssumptionBanner
          model="MOLA/LOLA DEM 20 m · éphémérides DE440"
          source={run.source.source}
          version={run.source.version}
          href="/documentation"
        />
      </div>
    );
  }

  if (run.status === "FAILED") {
    return (
      <div className="space-y-3">
        <ErrorState
          title="Calcul interrompu"
          message={run.error?.message ?? "Le run a échoué sans détail complémentaire."}
          code={run.error?.code}
          requestId={run.id}
        />
        <Card>
          <CardBody className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-body-sm text-on-surface-variant">
              Vérifiez la couverture DEM du site ou réduisez la fenêtre de calcul, puis relancez un
              scénario.
            </p>
            <div className="flex gap-2">
              <Link href={`/scenarios/${run.scenarioId}`}>
                <Button variant="secondary" size="sm">Voir le scénario</Button>
              </Link>
              <Link href={`/analyses/nouvelle?siteId=${scenario?.siteId ?? ""}`}>
                <Button size="sm">Nouveau scénario</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (seriesQuery.isPending || windowsQuery.isPending) {
    return <LoadingState label="Chargement des séries temporelles…" rows={4} />;
  }
  if (seriesQuery.isError || windowsQuery.isError) {
    return (
      <ErrorState
        title="Séries indisponibles"
        message={(seriesQuery.error ?? windowsQuery.error)?.message}
        onRetry={() => {
          void seriesQuery.refetch();
          void windowsQuery.refetch();
        }}
      />
    );
  }
  if (!series || !point) return <ErrorState title="Série vide" message="Aucun point de calcul renvoyé par l'API." />;

  const sunWindows = windows.filter((window) => window.body === "SUN");
  const earthWindows = windows.filter((window) => window.body === "EARTH");
  const allWindows = windows;

  return (
    <div className="space-y-3">
      <Card accent="primary">
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-label-md uppercase tracking-widest text-primary">
              Run {run.id} · scénario {scenario?.id ?? run.scenarioId}
            </p>
            <h2 className="mt-1 text-headline-lg font-heading">
              {scenario?.name ?? "Scénario"}
            </h2>
            <p className="mt-1 font-mono text-label-md text-on-surface-variant">
              {site
                ? `${site.name} · ${site.designation} · lat ${formatDegrees(site.coordinates.latitudeDeg, 4)}° · lon ${formatDegrees(site.coordinates.longitudeDeg, 4)}° · alt ${site.coordinates.altitudeM} m`
                : scenario?.siteName ?? "Site en cours de chargement"}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <RunStatusBadge status={run.status} />
              <QualityBadge value={run.quality} />
              <Badge tone="neutral">{series.points.length} points</Badge>
              <Badge tone="neutral">Pas {series.stepSeconds / 60} min</Badge>
              <Timestamp value={run.finishedAtUtc} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/comparateur?scenarios=${scenario?.id ?? ""}`}>
              <Button variant="secondary" size="sm">
                <Icon name="sliders" size={13} />
                Comparer
              </Button>
            </Link>
            <Link href="/rapports">
              <Button variant="secondary" size="sm">
                <Icon name="file" size={13} />
                Rapport
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card><CardBody><Metric label="Illumination cumulée" value={formatDuration(run.summary?.sunVisibleSeconds ?? 0)} icon={<Icon name="sun" size={13} />} /></CardBody></Card>
        <Card><CardBody><Metric label="Terre visible cumulée" value={formatDuration(run.summary?.earthVisibleSeconds ?? 0)} icon={<Icon name="earth" size={13} />} /></CardBody></Card>
        <Card><CardBody><Metric label="Nuit continue max." value={formatDuration(run.summary?.longestNightSeconds ?? 0)} /></CardBody></Card>
        <Card><CardBody><Metric label="Pas calculés" value={`${run.summary?.stepsCompleted ?? series.points.length}`} hint={`${series.stepSeconds / 60} min`} /></CardBody></Card>
      </div>

      <Tabs
        ariaLabel="Sections de l'analyse"
        items={[
          { id: "combine", label: "Vue combinée", icon: <Icon name="grid" size={13} /> },
          { id: "soleil", label: "Soleil", icon: <Icon name="sun" size={13} /> },
          { id: "terre", label: "Terre", icon: <Icon name="earth" size={13} /> },
          { id: "horizon", label: "Horizon", icon: <Icon name="chart" size={13} /> },
        ]}
        value={tab}
        onChange={setTab}
        panelIdPrefix="analysis"
      />

      <TabsPanel id="combine" value={tab} panelIdPrefix="analysis">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <SunCard point={point} />
            <EarthCard point={point} />
          </div>
          <Card>
            <CardHeader
              eyebrow="Scène du site"
              title="Soleil & Terre au-dessus de l'horizon"
              icon={<Icon name="moon" size={16} />}
              actions={<Timestamp value={point.atUtc} />}
            />
            <CardBody>
              <SiteScene
                sun={point.sun}
                earth={point.earth}
                horizonElevationDeg={point.horizonElevationDeg}
              />
              <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
                Position exacte au curseur de la chronologie. Affichage schématique.
              </p>
            </CardBody>
          </Card>
        </div>
      </TabsPanel>

      <TabsPanel id="soleil" value={tab} panelIdPrefix="analysis">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <SunCard point={point} />
          <Card>
            <CardHeader title="Fenêtres d'illumination" eyebrow="Soleil" icon={<Icon name="sun" size={16} />} />
            <CardBody className="max-h-80 overflow-y-auto scrollbar-thin">
              <WindowList windows={sunWindows} />
            </CardBody>
          </Card>
        </div>
      </TabsPanel>

      <TabsPanel id="terre" value={tab} panelIdPrefix="analysis">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <EarthCard point={point} />
          <Card>
            <CardHeader title="Fenêtres de visibilité terrestre" eyebrow="Terre" icon={<Icon name="earth" size={16} />} />
            <CardBody className="max-h-80 overflow-y-auto scrollbar-thin">
              <WindowList windows={earthWindows} />
            </CardBody>
          </Card>
        </div>
      </TabsPanel>

      <TabsPanel id="horizon" value={tab} panelIdPrefix="analysis">
        <Card>
          <CardHeader
            eyebrow="Masque de crête lunaire"
            title="Profil d'horizon topographique · 0° à 360°"
            icon={<Icon name="chart" size={16} />}
            actions={<Badge tone="neutral">Résolution {site?.dem.resolutionM ?? "—"} m/px</Badge>}
          />
          <CardBody>
            {site?.horizonProfile ? (
              <HorizonProfileChart
                samples={site.horizonProfile.samples}
                markers={[
                  { azimuthDeg: point.sun.azimuthDeg, label: `Soleil ${formatElevation(point.sun.elevationDeg)}`, tone: "sun" },
                  { azimuthDeg: point.earth.azimuthDeg, label: `Terre ${formatElevation(point.earth.elevationDeg)}`, tone: "earth" },
                ]}
              />
            ) : (
              <p className="text-body-sm text-on-surface-variant">
                Profil d&apos;horizon indisponible : couverture DEM insuffisante pour ce site.
              </p>
            )}
            <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
              Azimut observateur 0° à 360° · masque de crête lunaire échantillonné par ray-tracing.
            </p>
          </CardBody>
        </Card>
      </TabsPanel>

      <ScenarioTimeline
        series={series}
        windows={allWindows}
        cursorIndex={cursorIndex}
        onCursorChange={setCursor}
      />

      <AssumptionBanner
        model={run.source.model}
        source={run.source.source}
        version={run.source.version}
        href="/documentation"
      />
    </div>
  );
}

function SunCard({ point }: { point: TimeSeries["points"][number] }) {
  return (
    <Card>
      <CardHeader
        eyebrow="Télémétrie solaire"
        title="Soleil — énergie & illumination"
        icon={<Icon name="sun" size={16} />}
        actions={<VisibilityBadge value={point.sun.visibility} variant="compact" />}
      />
      <CardBody className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Azimut (0–360°)" value={point.sun.azimuthDeg.toFixed(2)} unit="°" />
          <Metric label="Élévation locale" value={formatElevation(point.sun.elevationDeg)} hint="Signée" />
        </div>
        <div>
          <div className="flex items-center justify-between font-mono text-label-sm uppercase text-on-surface-variant">
            <span>Flux solaire incident</span>
            <span className="tabular">{point.solarFluxWm2} W/m²</span>
          </div>
          <div className="mt-1 flex h-2 gap-px overflow-hidden rounded-sm bg-container-highest">
            {Array.from({ length: 24 }).map((_, index) => (
              <span
                key={index}
                className="h-full flex-1"
                style={{
                  backgroundColor:
                    index < Math.round((point.solarFluxWm2 / 1361) * 24) ? "#fbbf24" : "#30353f",
                }}
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-outline-variant pt-2">
          <Metric label="Horizon local" value={formatElevation(point.horizonElevationDeg)} />
          <Metric label="Horodatage" value={formatUtc(point.atUtc)} />
        </div>
        <p className="flex items-start gap-1 rounded border border-quality-low/30 bg-quality-low-soft/10 px-2 py-1 text-body-sm text-quality-low">
          <Icon name="alert-triangle" size={13} className="mt-0.5 shrink-0" />
          Soleil visible ≠ énergie produite : le rendement dépend de l&apos;incidence et de
          l&apos;obstruction locale.
        </p>
      </CardBody>
    </Card>
  );
}

function EarthCard({ point }: { point: TimeSeries["points"][number] }) {
  return (
    <Card accent="partial">
      <CardHeader
        eyebrow="Télémétrie Terre"
        title="Visibilité géométrique de la Terre"
        icon={<Icon name="earth" size={16} />}
        actions={<VisibilityBadge value={point.earth.visibility} variant="compact" />}
      />
      <CardBody className="space-y-2">
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Azimut (0–360°)" value={point.earth.azimuthDeg.toFixed(2)} unit="°" />
          <Metric label="Élévation" value={formatElevation(point.earth.elevationDeg)} hint="Signée" />
        </div>
        <div className="border-t border-outline-variant pt-2">
          <p className="text-body-sm text-on-surface-variant">
            Terre visible = visibilité géométrique, pas une garantie de liaison radio. Les masques
            topographiques locaux et les effets de diffusion ne sont pas modélisés dans le budget de
            liaison.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function WindowList({ windows }: { windows: VisibilityWindow[] }) {
  if (windows.length === 0) {
    return <p className="text-body-sm text-on-surface-variant">Aucune fenêtre sur cette période.</p>;
  }
  return (
    <ul className="divide-y divide-outline-variant/60 font-mono text-label-md">
      {windows.map((window) => (
        <li key={window.id} className="flex flex-wrap items-center justify-between gap-1 py-1">
          <Timestamp value={window.startsAtUtc} variant="compact" />
          <Timestamp value={window.endsAtUtc} variant="compact" />
          <span className="tabular text-on-surface-variant">{formatDuration(window.durationSeconds)}</span>
          <VisibilityBadge value={window.visibility} variant="compact" />
        </li>
      ))}
    </ul>
  );
}
