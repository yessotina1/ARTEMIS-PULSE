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
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
  Metric,
  PartialDataNotice,
  QualityBadge,
  Tabs,
  TabsPanel,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { HorizonProfileChart } from "@/components/lunar/horizon-profile";
import { useSite } from "@/hooks";
import { formatElevation, formatPercent } from "@/lib/format";

export function SiteDetailView({ siteId }: { siteId: string }) {
  const siteQuery = useSite(siteId);
  const [tab, setTab] = useState("synthese");

  if (siteQuery.isPending) return <LoadingState label="Chargement de la fiche du site…" rows={5} />;
  if (siteQuery.isError) {
    const isNotFound = siteQuery.error.message.toLowerCase().includes("introuvable");
    if (isNotFound) {
      return (
        <EmptyState
          icon="search"
          title="Site introuvable"
          description="Ce site n'existe pas dans le catalogue ou a été retiré."
          action={
            <Link href="/catalogue">
              <Button variant="secondary">Retour au catalogue</Button>
            </Link>
          }
        />
      );
    }
    return (
      <ErrorState
        message={siteQuery.error.message}
        onRetry={() => void siteQuery.refetch()}
      />
    );
  }

  const site = siteQuery.data;

  return (
    <div className="space-y-3">
      <Card accent={site.dem.status === "FULL" ? "primary" : "partial"}>
        <CardBody className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-label-md uppercase tracking-widest text-primary">
              {site.designation} · {site.mission}
            </p>
            <h2 className="mt-1 text-headline-lg font-heading">{site.name}</h2>
            <p className="mt-1 max-w-2xl text-body-md text-on-surface-variant">{site.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <QualityBadge value={site.quality} />
              <Badge tone="primary">{site.category}</Badge>
              <VisibilityBadge value={site.referenceState.sunVisibility} />
              <VisibilityBadge value={site.referenceState.earthVisibility} />
              {site.tags.map((tag) => (
                <Badge key={tag} tone="neutral">{tag}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/analyses/nouvelle?siteId=${site.id}`}>
              <Button>
                <Icon name="spark" size={14} />
                Lancer une analyse
              </Button>
            </Link>
            <Link href="/comparateur">
              <Button variant="secondary">Comparer</Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {site.dem.status !== "FULL" ? (
        <PartialDataNotice
          message={
            site.dem.status === "NONE"
              ? "Aucune couverture DEM pour ce site : la visibilité géométrique est marquée UNKNOWN et aucun calcul n'est possible."
              : `Couverture DEM partielle (${site.dem.resolutionM ?? "?"} m/px). ${site.dem.note ?? "Les fenêtres d'occultation restent estimées."}`
          }
        />
      ) : null}

      <Tabs
        ariaLabel="Sections de la fiche du site"
        items={[
          { id: "synthese", label: "Synthèse", icon: <Icon name="grid" size={13} /> },
          { id: "horizon", label: "Horizon", icon: <Icon name="chart" size={13} /> },
          { id: "modele", label: "Modèle & provenance", icon: <Icon name="layers" size={13} /> },
        ]}
        value={tab}
        onChange={setTab}
        panelIdPrefix="site-detail"
      />

      <TabsPanel id="synthese" value={tab} panelIdPrefix="site-detail">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardHeader
              eyebrow="Coordonnées géodésiques"
              title="Position MOLA"
              icon={<Icon name="pin" size={16} />}
            />
            <CardBody className="grid grid-cols-2 gap-3">
              <Metric label="Latitude" value={site.coordinates.latitudeDeg.toFixed(4)} unit="°" />
              <Metric label="Longitude" value={site.coordinates.longitudeDeg.toFixed(4)} unit="°" />
              <Metric label="Altitude" value={site.coordinates.altitudeM} unit="m" />
              <Metric
                label="Nuit continue max."
                value={site.maxContinuousDarknessHours ?? "—"}
                unit="h"
                digits={1}
              />
              <div className="col-span-2 border-t border-outline-variant pt-2">
                <Timestamp value={site.referenceEphemerisUtc} variant="block" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Visibilité géométrique de référence"
              title="Soleil & Terre"
              icon={<Icon name="sun" size={16} />}
            />
            <CardBody className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-label-md uppercase text-on-surface-variant">Soleil</span>
                  <VisibilityBadge value={site.referenceState.sunVisibility} variant="compact" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Metric label="Azimut" value={site.referenceState.sun.azimuthDeg.toFixed(2)} unit="°" />
                  <Metric label="Élévation" value={formatElevation(site.referenceState.sun.elevationDeg)} />
                  <Metric label="Flux" value={site.referenceState.solarFluxWm2} unit="W/m²" />
                </div>
              </div>
              <div className="border-t border-outline-variant pt-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono text-label-md uppercase text-on-surface-variant">Terre</span>
                  <VisibilityBadge value={site.referenceState.earthVisibility} variant="compact" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Azimut" value={site.referenceState.earth.azimuthDeg.toFixed(2)} unit="°" />
                  <Metric label="Élévation" value={formatElevation(site.referenceState.earth.elevationDeg)} />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Card>
            <CardBody>
              <Metric
                label="Illumination moyenne (14 j)"
                value={site.illuminationPercent ?? "—"}
                unit="%"
                digits={1}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Metric
                label="Couverture DEM"
                value={
                  site.dem.status === "FULL"
                    ? `${site.dem.resolutionM ?? "—"} m/px`
                    : site.dem.status === "PARTIAL"
                      ? "Partielle"
                      : "Absente"
                }
                hint={site.dem.source ?? "Aucune source"}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Metric
                label="Élévation solaire rasant"
                value={formatPercent(site.illuminationPercent, 1)}
                hint="Part du temps au-dessus de l'horizon"
              />
            </CardBody>
          </Card>
        </div>
      </TabsPanel>

      <TabsPanel id="horizon" value={tab} panelIdPrefix="site-detail">
        <Card>
          <CardHeader
            eyebrow="Profil topographique"
            title="Horizon 0° → 360°"
            icon={<Icon name="chart" size={16} />}
            actions={
              site.horizonProfile ? (
                <Badge tone="neutral">
                  Pas {site.horizonProfile.resolutionDeg}° · {site.horizonProfile.samples.length} points
                </Badge>
              ) : null
            }
          />
          <CardBody>
            {site.horizonProfile ? (
              <>
                <HorizonProfileChart
                  samples={site.horizonProfile.samples}
                  markers={[
                    {
                      azimuthDeg: site.referenceState.sun.azimuthDeg,
                      label: `Soleil ${formatElevation(site.referenceState.sun.elevationDeg)}`,
                      tone: "sun",
                    },
                    {
                      azimuthDeg: site.referenceState.earth.azimuthDeg,
                      label: `Terre ${formatElevation(site.referenceState.earth.elevationDeg)}`,
                      tone: "earth",
                    },
                  ]}
                />
                <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
                  Azimut de l&apos;observateur (0° à 360°) · graticule horizontal calé sur l&apos;ellipsoïde.
                  Sources : {site.horizonProfile.source.source} · {site.horizonProfile.source.version}.
                </p>
              </>
            ) : (
              <EmptyState
                icon="alert-triangle"
                title="Profil d'horizon non calculable"
                description="La couverture DEM est insuffisante pour produire un profil fiable sur ce site."
              />
            )}
          </CardBody>
        </Card>
      </TabsPanel>

      <TabsPanel id="modele" value={tab} panelIdPrefix="site-detail">
        <Card>
          <CardHeader eyebrow="Provenance" title="Modèles et versions" icon={<Icon name="layers" size={16} />} />
          <CardBody>
            <dl className="grid gap-2 text-body-sm sm:grid-cols-2">
              {[
                ["Source éphémérides", site.referenceState.source.source],
                ["Version des données", site.referenceState.source.version],
                ["Modèle de terrain", site.referenceState.source.model ?? "—"],
                ["Résolution DEM", site.dem.resolutionM ? `${site.dem.resolutionM} m/px` : "Indisponible"],
                ["Source DEM", site.dem.source ?? "Indisponible"],
                ["Qualité de référence", site.quality],
              ].map(([label, value]) => (
                <div key={label} className="flex items-baseline justify-between gap-2 border-b border-outline-variant/50 pb-1">
                  <dt className="text-on-surface-variant">{label}</dt>
                  <dd className="font-mono text-label-md text-on-surface">{value}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </TabsPanel>

      <AssumptionBanner
        model={site.referenceState.source.model}
        source={site.referenceState.source.source}
        version={site.referenceState.source.version}
        href="/documentation"
      />
    </div>
  );
}
