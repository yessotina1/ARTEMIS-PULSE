import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  DemoBanner,
  Icon,
  Metric,
  QualityBadge,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { formatDuration, formatElevation } from "@/lib/format";
import type { Run, Scenario, SiteDetail, TimeSeries, VisibilityWindow } from "@/types";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export const metadata: Metadata = {
  title: "Analyse de démonstration",
  description:
    "Analyse de démonstration en mode invité : fenêtres d'illumination et de visibilité terrestre d'un scénario Shackleton Rim.",
};

export default async function DemoPage() {
  const scenario: Scenario = await api.scenarios.get("scn-art3-001");
  const run: Run = await api.runs.get("run-ap-8444");
  const site: SiteDetail = await api.sites.get(scenario.siteId);
  const series: TimeSeries = await api.runs.series(run.id);
  const windows: VisibilityWindow[] = await api.runs.visibilityWindows(run.id);

  const sunWindows = windows.filter((w) => w.body === "SUN").slice(0, 6);
  const earthWindows = windows.filter((w) => w.body === "EARTH").slice(0, 6);
  const sample = series.points[Math.floor(series.points.length / 3)];

  return (
    <div className="mx-auto max-w-6xl space-y-3 px-margin-mobile py-5 md:px-margin">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="primary">Mode invité</Badge>
            <DemoBanner />
            <QualityBadge value={run.quality} />
          </div>
          <h1 className="mt-2 text-headline-xl font-heading">{scenario.name}</h1>
          <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">
            Analyse de démonstration rejouée depuis un run terminé : illumination et visibilité
            géométrique de la Terre sur la fenêtre du scénario. Aucun compte requis.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/inscription">
            <Button>Créer un compte pour lancer vos analyses</Button>
          </Link>
          <Link href="/connexion">
            <Button variant="secondary">Se connecter</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader
          eyebrow={`Run ${run.id}`}
          title={site.name}
          icon={<Icon name="moon" size={16} />}
          actions={
            <>
              <Badge tone="success">TERMINÉ</Badge>
              <Timestamp value={run.finishedAtUtc} />
            </>
          }
        />
        <CardBody className="grid gap-3 md:grid-cols-4">
          <Metric label="Latitude" value={site.coordinates.latitudeDeg.toFixed(4)} unit="°" />
          <Metric label="Longitude" value={site.coordinates.longitudeDeg.toFixed(4)} unit="°" />
          <Metric label="Altitude" value={site.coordinates.altitudeM} unit="m" />
          <Metric label="Pas de calcul" value={scenario.window.steps} hint={`${scenario.window.stepSeconds / 60} min`} />
        </CardBody>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        <Card accent="primary">
          <CardHeader eyebrow="Soleil" title="Visibilité et flux" icon={<Icon name="sun" size={16} />} />
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-label-sm uppercase text-on-surface-variant">
                Au tiers de la fenêtre
              </span>
              <VisibilityBadge value={sample.sun.visibility} variant="compact" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Metric label="Azimut" value={sample.sun.azimuthDeg.toFixed(2)} unit="°" />
              <Metric label="Élévation" value={formatElevation(sample.sun.elevationDeg)} />
              <Metric label="Flux" value={sample.solarFluxWm2} unit="W/m²" />
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Soleil visible ≠ énergie produite : le rendement dépend de l&apos;incidence et de
              l&apos;obstruction locale.
            </p>
          </CardBody>
        </Card>

        <Card accent="partial">
          <CardHeader eyebrow="Terre" title="Visibilité géométrique" icon={<Icon name="earth" size={16} />} />
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-label-sm uppercase text-on-surface-variant">
                Au tiers de la fenêtre
              </span>
              <VisibilityBadge value={sample.earth.visibility} variant="compact" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Azimut" value={sample.earth.azimuthDeg.toFixed(2)} unit="°" />
              <Metric label="Élévation" value={formatElevation(sample.earth.elevationDeg)} />
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Terre visible = visibilité géométrique, pas une garantie de liaison radio.
            </p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card>
          <CardHeader title="Fenêtres d'illumination" eyebrow="Soleil" />
          <CardBody>
            <ul className="divide-y divide-outline-variant/60 font-mono text-label-md">
              {sunWindows.map((window) => (
                <li key={window.id} className="flex flex-wrap items-center justify-between gap-1 py-1">
                  <Timestamp value={window.startsAtUtc} />
                  <span className="text-on-surface-variant">→</span>
                  <Timestamp value={window.endsAtUtc} />
                  <span className="text-on-surface-variant">{formatDuration(window.durationSeconds)}</span>
                  <VisibilityBadge value={window.visibility} variant="compact" />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Fenêtres de visibilité terrestre" eyebrow="Terre" />
          <CardBody>
            <ul className="divide-y divide-outline-variant/60 font-mono text-label-md">
              {earthWindows.map((window) => (
                <li key={window.id} className="flex flex-wrap items-center justify-between gap-1 py-1">
                  <Timestamp value={window.startsAtUtc} />
                  <span className="text-on-surface-variant">→</span>
                  <Timestamp value={window.endsAtUtc} />
                  <span className="text-on-surface-variant">{formatDuration(window.durationSeconds)}</span>
                  <VisibilityBadge value={window.visibility} variant="compact" />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <AssumptionBanner
        model={series.source.model}
        source={series.source.source}
        version={series.source.version}
        href="/documentation"
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-primary/30 bg-primary/5 p-3">
        <div>
          <p className="font-heading text-headline-sm">Passez en mode planificateur</p>
          <p className="text-body-sm text-on-surface-variant">
            Créez vos scénarios, comparez jusqu&apos;à quatre sites et exportez les rapports.
          </p>
        </div>
        <Link href="/inscription">
          <Button>Créer un compte</Button>
        </Link>
      </div>
    </div>
  );
}
