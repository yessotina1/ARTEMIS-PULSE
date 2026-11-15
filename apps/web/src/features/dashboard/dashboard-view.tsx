"use client";

import Link from "next/link";
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
  Timestamp,
} from "@/components/ui";
import { useRuns, useScenarios, useSites } from "@/hooks";
import { formatDegrees, formatDuration, formatPercent } from "@/lib/format";
import type { Run, Scenario, SiteSummary } from "@/types";

function nearestPriority(runs: Run[]): Run | null {
  return (
    runs.find((run) => run.status === "FAILED") ??
    runs.find((run) => run.status === "RUNNING") ??
    runs.find((run) => run.status === "QUEUED") ??
    runs[0] ??
    null
  );
}

function SiteTile({ site }: { site: SiteSummary }) {
  return (
    <Link
      href={`/catalogue/${site.id}`}
      className="group flex flex-col gap-1 rounded border border-grid bg-container p-2 transition-colors hover:border-primary/50 hover:bg-container-high"
    >
      <div className="flex items-start justify-between gap-1">
        <div>
          <p className="font-mono text-label-sm uppercase text-on-surface-variant">
            {site.designation}
          </p>
          <p className="text-body-md text-on-surface group-hover:text-primary">{site.name}</p>
        </div>
        <QualityBadge value={site.quality} />
      </div>
      <p className="font-mono text-label-sm text-on-surface-variant">
        {formatDegrees(site.coordinates.latitudeDeg, 2)}° · {formatDegrees(site.coordinates.longitudeDeg, 2)}° ·{" "}
        {site.coordinates.altitudeM} m
      </p>
    </Link>
  );
}

export function DashboardView() {
  const scenariosQuery = useScenarios();
  const runsQuery = useRuns();
  const sitesQuery = useSites();

  if (scenariosQuery.isPending || runsQuery.isPending || sitesQuery.isPending) {
    return <LoadingState label="Chargement de la console…" rows={5} />;
  }

  if (scenariosQuery.isError || runsQuery.isError || sitesQuery.isError) {
    const error = scenariosQuery.error ?? runsQuery.error ?? sitesQuery.error;
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Erreur inconnue."}
        onRetry={() => {
          void scenariosQuery.refetch();
          void runsQuery.refetch();
          void sitesQuery.refetch();
        }}
      />
    );
  }

  const scenarios = scenariosQuery.data;
  const runs = runsQuery.data;
  const sites = sitesQuery.data;
  const scenarioById = new Map(scenarios.map((scenario) => [scenario.id, scenario]));
  const failedRuns = runs.filter((run) => run.status === "FAILED");
  const activeRuns = runs.filter((run) => run.status === "RUNNING" || run.status === "QUEUED");
  const priorityRun = nearestPriority(runs);
  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.submittedAtUtc).getTime() - new Date(a.submittedAtUtc).getTime())
    .slice(0, 5);
  const recentScenarios = scenarios.slice(0, 3);
  const studiedSites = sites.slice(0, 4);
  const referenceSite = sites.find((site) => site.dem.status === "FULL") ?? sites[0];

  return (
    <div className="space-y-3">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-3" accent="primary">
        <div>
          <p className="font-mono text-label-md uppercase tracking-widest text-primary">
            Console planificateur
          </p>
          <h2 className="mt-1 text-headline-lg font-heading">Nouvelle analyse</h2>
          <p className="mt-1 max-w-xl text-body-md text-on-surface-variant">
            Sélectionnez un site, définissez la fenêtre UTC et lancez un calcul de visibilité
            géométrique Soleil / Terre.
          </p>
        </div>
        <Link href="/analyses/nouvelle">
          <Button size="lg">
            <Icon name="spark" size={14} />
            Nouvelle analyse
          </Button>
        </Link>
      </Card>

      {failedRuns.length > 0 || activeRuns.length > 0 ? (
        <Card accent="partial" role="status" aria-live="polite">
          <CardHeader
            eyebrow="Alertes télémétriques"
            title={`${failedRuns.length + activeRuns.length} run(s) demandent votre attention`}
            icon={<Icon name="alert-triangle" size={16} />}
          />
          <CardBody className="space-y-2">
            {failedRuns.slice(0, 1).map((run) => {
              const scenario = scenarioById.get(run.scenarioId);
              return (
                <div key={run.id} className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-body-md text-on-surface">
                      {scenario?.name ?? run.scenarioId} — <span className="text-error">{run.error?.code}</span>
                    </p>
                    <p className="text-body-sm text-on-surface-variant">{run.error?.message}</p>
                  </div>
                  <Link href={`/scenarios/${run.scenarioId}`}>
                    <Button variant="secondary" size="sm">
                      Consulter le scénario
                    </Button>
                  </Link>
                </div>
              );
            })}
            {activeRuns.slice(0, 1).map((run) => {
              const scenario = scenarioById.get(run.scenarioId);
              return (
                <div key={run.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-outline-variant pt-2">
                  <div className="flex items-center gap-2">
                    <RunStatusBadge status={run.status} />
                    <span className="text-body-md">{scenario?.name ?? run.scenarioId}</span>
                  </div>
                  <Link href={`/analyses/${run.id}`} className="font-mono text-label-md text-primary hover:underline">
                    Suivre le run {run.id} →
                  </Link>
                </div>
              );
            })}
          </CardBody>
        </Card>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
        <Card className="min-w-0">
          <CardHeader
            eyebrow="Analyses récentes"
            title="Runs de calcul"
            icon={<Icon name="chart" size={16} />}
            actions={
              <Link href="/scenarios">
                <Button variant="ghost" size="sm">
                  Tout voir
                </Button>
              </Link>
            }
          />
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <caption className="sr-only">Cinq derniers runs de calcul</caption>
              <thead>
                <tr className="border-b border-outline-variant font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                  <th scope="col" className="px-3 py-1 font-medium">Scénario</th>
                  <th scope="col" className="px-3 py-1 font-medium">Statut</th>
                  <th scope="col" className="px-3 py-1 font-medium">Qualité</th>
                  <th scope="col" className="px-3 py-1 font-medium">Soumis</th>
                </tr>
              </thead>
              <tbody>
                {recentRuns.map((run) => {
                  const scenario = scenarioById.get(run.scenarioId);
                  return (
                    <tr key={run.id} className="border-b border-outline-variant/50 last:border-0">
                      <td className="px-3 py-1">
                        <Link href={`/analyses/${run.id}`} className="text-body-md hover:text-primary hover:underline">
                          {scenario?.name ?? run.id}
                        </Link>
                        <p className="font-mono text-label-sm text-on-surface-variant">
                          {scenario?.siteName ?? "Site inconnu"}
                        </p>
                      </td>
                      <td className="px-3 py-1"><RunStatusBadge status={run.status} /></td>
                      <td className="px-3 py-1"><QualityBadge value={run.quality} /></td>
                      <td className="px-3 py-1"><Timestamp value={run.submittedAtUtc} variant="compact" /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardHeader
              eyebrow="Intégrité télémétrique"
              title="Sources et modèles"
              icon={<Icon name="layers" size={16} />}
              actions={<Badge tone="success">Flux nominal</Badge>}
            />
            <CardBody className="space-y-2">
              {[
                ["Éphémérides planétaires", "DE440 / DE442", "valid"],
                ["Modèle de terrain", "MOLA/LOLA DEM 20 m", "valid"],
                ["Horizon 360°", "Ray-tracing 45 km, 5 m/px", "valid"],
              ].map(([label, value]) => (
                <div key={label} className="flex flex-wrap items-center justify-between gap-1 border-b border-outline-variant/50 pb-1 last:border-0 last:pb-0">
                  <span className="text-body-sm text-on-surface-variant">{label}</span>
                  <span className="font-mono text-label-md text-tertiary">{value}</span>
                </div>
              ))}
              {referenceSite ? (
                <div className="border-t border-outline-variant pt-2">
                  <p className="font-mono text-label-sm uppercase text-on-surface-variant">
                    Site de référence
                  </p>
                  <p className="text-body-md">{referenceSite.name}</p>
                  <p className="font-mono text-label-sm text-on-surface-variant">
                    Illumination moyenne {formatPercent(referenceSite.illuminationPercent, 1)}
                  </p>
                </div>
              ) : null}
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Sites étudiés récemment"
              title="Catalogue"
              icon={<Icon name="map" size={16} />}
              actions={
                <Link href="/catalogue">
                  <Button variant="ghost" size="sm">Catalogue</Button>
                </Link>
              }
            />
            <CardBody className="space-y-1">
              {studiedSites.map((site) => (
                <SiteTile key={site.id} site={site} />
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow="Scénarios actifs"
          title="Mes scénarios récents"
          icon={<Icon name="spark" size={16} />}
          actions={
            <Link href="/scenarios">
              <Button variant="secondary" size="sm">Tous les scénarios</Button>
            </Link>
          }
        />
        <CardBody className="grid gap-3 md:grid-cols-3">
          {recentScenarios.map((scenario) => (
            <ScenarioTile key={scenario.id} scenario={scenario} />
          ))}
        </CardBody>
      </Card>

      {priorityRun?.summary ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <CardBody>
              <Metric
                label="Illumination cumulée (run prioritaire)"
                value={formatDuration(priorityRun.summary.sunVisibleSeconds)}
                hint="Soleil au-dessus de l'horizon"
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Metric
                label="Visibilité Terre cumulée"
                value={formatDuration(priorityRun.summary.earthVisibleSeconds)}
                hint="Géométrie seule"
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Metric
                label="Nuit continue maximale"
                value={formatDuration(priorityRun.summary.longestNightSeconds)}
                hint="Sur la fenêtre du scénario"
              />
            </CardBody>
          </Card>
        </div>
      ) : null}

      <AssumptionBanner
        model="MOLA/LOLA DEM 20 m · éphémérides DE440 · réfraction nulle"
        source="SPICE / MOON_PA_DE440"
        version="2029.1"
        href="/documentation"
      />
    </div>
  );
}

function ScenarioTile({ scenario }: { scenario: Scenario }) {
  return (
    <div className="flex flex-col gap-1 rounded border border-grid bg-container-low p-2">
      <div className="flex items-start justify-between gap-1">
        <p className="text-body-md text-on-surface">{scenario.name}</p>
        <QualityBadge value={scenario.quality} />
      </div>
      <p className="font-mono text-label-sm text-on-surface-variant">{scenario.siteName}</p>
      <div className="flex flex-wrap gap-1">
        <Badge tone="neutral">{scenario.window.steps} pas</Badge>
        <Badge tone="neutral">{scenario.window.stepSeconds / 60} min</Badge>
      </div>
      <div className="mt-auto flex flex-wrap items-center justify-between gap-1 border-t border-outline-variant pt-1">
        <Timestamp value={scenario.window.startUtc} variant="compact" />
        <Link href={`/scenarios/${scenario.id}`} className="font-mono text-label-md text-primary hover:underline">
          Détail →
        </Link>
      </div>
    </div>
  );
}
