"use client";

import Link from "next/link";
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
  Metric,
  QualityBadge,
  RunStatusBadge,
  Timestamp,
} from "@/components/ui";
import { useCreateRun, useRun, useScenario, useScenarioRuns, useSite } from "@/hooks";
import { formatDegrees, formatDuration, formatElevation } from "@/lib/format";

export function ScenarioDetailView({ scenarioId }: { scenarioId: string }) {
  const scenarioQuery = useScenario(scenarioId);
  const scenario = scenarioQuery.data;
  const siteQuery = useSite(scenario?.siteId ?? "");
  const site = siteQuery.data;
  const runsQuery = useScenarioRuns(scenarioId);
  const lastRunQuery = useRun(scenario?.lastRunId ?? null);
  const createRun = useCreateRun();

  if (scenarioQuery.isPending) return <LoadingState label="Chargement du scénario…" rows={4} />;
  if (scenarioQuery.isError) {
    return (
      <ErrorState
        title="Scénario introuvable"
        message={scenarioQuery.error.message}
        onRetry={() => void scenarioQuery.refetch()}
      />
    );
  }
  if (!scenario) return null;

  const lastRun = lastRunQuery.data;

  return (
    <div className="space-y-3">
      <Card accent="primary">
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-label-md uppercase tracking-widest text-primary">
              {scenario.id} · {scenario.owner ?? "Planificateur"}
            </p>
            <h2 className="mt-1 text-headline-lg font-heading">{scenario.name}</h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {scenario.siteName} · observateur {scenario.observer.name} ({scenario.observer.heightM} m,{" "}
              {scenario.observer.mode === "ZENITH" ? "zénith" : "surface du site"})
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <QualityBadge value={scenario.quality} />
              <Badge tone={scenario.status === "FAILED" ? "danger" : scenario.status === "READY" ? "success" : "neutral"}>
                {scenario.status}
              </Badge>
              <Badge tone="neutral">{scenario.window.steps} pas</Badge>
              <Badge tone="neutral">Pas {scenario.window.stepSeconds / 60} min</Badge>
              {scenario.tags.map((tag) => (
                <Badge key={tag} tone="primary">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {lastRun ? (
              <Link href={`/analyses/${lastRun.id}`}>
                <Button>
                  <Icon name="chart" size={14} />
                  Ouvrir l&apos;analyse
                </Button>
              </Link>
            ) : null}
            <Button
              variant="secondary"
              loading={createRun.isPending}
              onClick={() => void createRun.mutateAsync(scenario.id)}
            >
              <Icon name="spark" size={14} />
              Relancer le calcul
            </Button>
            <Link href={`/comparateur?scenarios=${scenario.id}`}>
              <Button variant="secondary">Comparer</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader
            eyebrow="Fenêtre de calcul"
            title="Paramètres du scénario"
            icon={<Icon name="clock" size={16} />}
          />
          <CardBody className="space-y-2">
            <dl className="grid gap-2 sm:grid-cols-2">
              {[
                ["Début (UTC)", <Timestamp key="start" value={scenario.window.startUtc} />],
                ["Fin (UTC)", <Timestamp key="end" value={scenario.window.endUtc} />],
                ["Pas de temps", `${scenario.window.stepSeconds / 60} min`],
                ["Pas de calcul", `${scenario.window.steps}`],
                ["Observateur", `${scenario.observer.name} · ${scenario.observer.heightM} m`],
                ["Mode", scenario.observer.mode === "ZENITH" ? "Zénith" : "Surface du site"],
                ["Créé le", <Timestamp key="created" value={scenario.createdAt} />],
                ["Mis à jour", <Timestamp key="updated" value={scenario.updatedAt} />],
              ].map(([label, value]) => (
                <div key={String(label)} className="flex items-baseline justify-between gap-2 border-b border-outline-variant/50 pb-1">
                  <dt className="text-body-sm text-on-surface-variant">{label}</dt>
                  <dd className="text-right font-mono text-label-md text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
            {scenario.notes ? (
              <p className="rounded border border-outline-variant bg-container-low p-2 text-body-sm text-on-surface-variant">
                {scenario.notes}
              </p>
            ) : null}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            eyebrow="Dernier run"
            title={lastRun ? lastRun.id : "Aucun run"}
            icon={<Icon name="spark" size={16} />}
            actions={lastRun ? <RunStatusBadge status={lastRun.status} /> : null}
          />
          <CardBody className="space-y-2">
            {lastRun ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Progression" value={lastRun.progressPercent} unit="%" />
                  <Metric
                    label="Qualité"
                    value={lastRun.quality}
                    hint={lastRun.error ? lastRun.error.code : "Run terminé"}
                  />
                  <Metric label="Soumis" value={lastRun.submittedAtUtc.slice(11, 16)} />
                  <Metric label="Terminé" value={lastRun.finishedAtUtc?.slice(11, 16) ?? "—"} />
                </div>
                {lastRun.error ? (
                  <p className="rounded border border-error/40 bg-error-container/20 px-2 py-1 text-body-sm text-error">
                    {lastRun.error.message}
                  </p>
                ) : null}
                {lastRun.summary ? (
                  <ul className="space-y-1 border-t border-outline-variant pt-2 font-mono text-label-md">
                    <li className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Illumination cumulée</span>
                      <span>{formatDuration(lastRun.summary.sunVisibleSeconds)}</span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Terre visible cumulée</span>
                      <span>{formatDuration(lastRun.summary.earthVisibleSeconds)}</span>
                    </li>
                    <li className="flex justify-between gap-2">
                      <span className="text-on-surface-variant">Nuit continue max.</span>
                      <span>{formatDuration(lastRun.summary.longestNightSeconds)}</span>
                    </li>
                  </ul>
                ) : null}
              </>
            ) : (
              <EmptyState
                icon="spark"
                title="Aucun run lancé"
                description="Lancez le calcul pour produire les séries temporelles et les fenêtres de visibilité."
              />
            )}
          </CardBody>
        </Card>
      </div>

      {site ? (
        <Card>
          <CardHeader
            eyebrow="Site du scénario"
            title={site.name}
            icon={<Icon name="pin" size={16} />}
            actions={<QualityBadge value={site.quality} />}
          />
          <CardBody className="grid gap-3 sm:grid-cols-4">
            <Metric label="Latitude" value={formatDegrees(site.coordinates.latitudeDeg, 4)} unit="°" />
            <Metric label="Longitude" value={formatDegrees(site.coordinates.longitudeDeg, 4)} unit="°" />
            <Metric
              label="Élévation solaire de référence"
              value={formatElevation(site.referenceState.sun.elevationDeg)}
            />
            <Metric
              label="Couverture DEM"
              value={site.dem.status === "FULL" ? `${site.dem.resolutionM} m/px` : site.dem.status}
            />
            <div className="sm:col-span-4 border-t border-outline-variant pt-2">
              <Link href={`/catalogue/${site.id}`} className="font-mono text-label-md text-primary hover:underline">
                Fiche détaillée du site →
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader
          eyebrow="Historique"
          title="Runs du scénario"
          icon={<Icon name="file" size={16} />}
          actions={<Badge tone="neutral">{runsQuery.data?.length ?? 0} run(s)</Badge>}
        />
        <CardBody>
          {runsQuery.isPending ? (
            <LoadingState label="Chargement de l'historique…" rows={2} />
          ) : runsQuery.data && runsQuery.data.length > 0 ? (
            <ul className="divide-y divide-outline-variant/60">
              {runsQuery.data.map((run) => (
                <li key={run.id} className="flex flex-wrap items-center justify-between gap-1 py-1">
                  <Link href={`/analyses/${run.id}`} className="font-mono text-label-md text-primary hover:underline">
                    {run.id}
                  </Link>
                  <RunStatusBadge status={run.status} />
                  <QualityBadge value={run.quality} />
                  <Timestamp value={run.submittedAtUtc} variant="compact" />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-on-surface-variant">Aucun run enregistré.</p>
          )}
        </CardBody>
      </Card>

      <AssumptionBanner
        model={scenario.source.model}
        source={scenario.source.source}
        version={scenario.source.version}
        href="/documentation"
      />
    </div>
  );
}
