"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
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
  Tabs,
  Timestamp,
} from "@/components/ui";
import { PolarMap } from "@/components/lunar/polar-map";
import { useSites } from "@/hooks";
import { formatPercent } from "@/lib/format";

const CesiumGlobe = dynamic(() => import("./cesium-globe"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded border border-outline-variant bg-container-low md:h-[560px]" />
  ),
});

type ExplorerView = "globe" | "polar";

export function ExplorerView() {
  const sitesQuery = useSites();
  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);
  const southPoleSites = useMemo(
    () => sites.filter((site) => site.coordinates.latitudeDeg < -60),
    [sites],
  );

  const [view, setView] = useState<ExplorerView>("polar");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cesiumFailed, setCesiumFailed] = useState(false);

  if (sitesQuery.isPending) return <LoadingState label="Chargement de la cartographie…" rows={4} />;
  if (sitesQuery.isError) {
    return (
      <ErrorState
        message={sitesQuery.error instanceof Error ? sitesQuery.error.message : undefined}
        onRetry={() => void sitesQuery.refetch()}
      />
    );
  }

  const selected = sites.find((site) => site.id === selectedId) ?? southPoleSites[0] ?? sites[0];

  return (
    <div className="grid gap-3 xl:grid-cols-[240px_1fr_320px]">
      <Card className="min-w-0">
        <CardHeader eyebrow="Sites candidats" title="Zone clé sud" icon={<Icon name="target" size={16} />} />
        <CardBody className="space-y-1">
          <p className="font-mono text-label-sm uppercase text-on-surface-variant">
            {southPoleSites.length} sites au pôle Sud
          </p>
          <ul className="space-y-1">
            {southPoleSites.map((site) => {
              const active = site.id === selected?.id;
              return (
                <li key={site.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(site.id)}
                    aria-pressed={active}
                    className={`w-full rounded border px-2 py-1 text-left transition-colors ${
                      active
                        ? "border-primary/60 bg-primary/10"
                        : "border-grid hover:border-outline-variant hover:bg-container-high"
                    }`}
                  >
                    <span className="block text-body-md text-on-surface">{site.name}</span>
                    <span className="block font-mono text-label-sm text-on-surface-variant">
                      {site.coordinates.latitudeDeg.toFixed(2)}° · {site.coordinates.longitudeDeg.toFixed(2)}°
                    </span>
                    <span className="mt-1 flex flex-wrap gap-1">
                      <QualityBadge value={site.quality} />
                      <Badge tone={site.dem.status === "FULL" ? "success" : "warning"}>
                        {site.dem.status === "FULL"
                          ? `DEM ${site.dem.resolutionM} m`
                          : site.dem.status === "PARTIAL"
                            ? "DEM partielle"
                            : "DEM absente"}
                      </Badge>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>

      <Card className="min-w-0">
        <CardHeader
          eyebrow="Cartographie"
          title="Projection polaire & globe"
          icon={<Icon name="globe" size={16} />}
          actions={
            <Tabs
              ariaLabel="Mode de cartographie"
              items={[
                { id: "polar", label: "Carte polaire", icon: <Icon name="map" size={13} /> },
                { id: "globe", label: "Globe 3D", icon: <Icon name="globe" size={13} /> },
              ]}
              value={view}
              onChange={(id) => setView(id as ExplorerView)}
              panelIdPrefix="explorer"
            />
          }
        />

        <CardBody className="space-y-2">
          {view === "globe" && !cesiumFailed ? (
            <CesiumGlobe
              sites={southPoleSites}
              onSelect={(siteId) => setSelectedId(siteId)}
              view="global"
              onError={() => setCesiumFailed(true)}
            />
          ) : (
            <>
              {cesiumFailed ? (
                <p className="rounded border border-quality-low/40 bg-quality-low-soft/20 px-2 py-1 text-body-sm text-quality-low">
                  <Icon name="alert-triangle" size={13} className="mr-1 inline" />
                  Le rendu 3D Cesium n&apos;a pas pu démarrer dans ce navigateur. La carte polaire
                  2D reste disponible avec la même sélection de sites.
                </p>
              ) : null}
              <PolarMap
                sites={southPoleSites}
                selectedId={selected?.id}
                onSelect={setSelectedId}
                variant="full"
              />
              <p className="font-mono text-label-sm text-on-surface-variant">
                Projection stéréographique schématique · 0° méridien vers la Terre · sélection par
                clic ou clavier.
              </p>
            </>
          )}
        </CardBody>
      </Card>

      {selected ? (
        <Card accent="primary" className="min-w-0">
          <CardHeader
            eyebrow="Site sélectionné"
            title={selected.name}
            icon={<Icon name="pin" size={16} />}
            actions={<QualityBadge value={selected.quality} />}
          />
          <CardBody className="space-y-2">
            <p className="font-mono text-label-sm text-on-surface-variant">{selected.designation}</p>
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Latitude" value={selected.coordinates.latitudeDeg.toFixed(3)} unit="°" />
              <Metric label="Longitude" value={selected.coordinates.longitudeDeg.toFixed(3)} unit="°" />
              <Metric label="Altitude" value={selected.coordinates.altitudeM} unit="m" />
              <Metric
                label="Illumination"
                value={selected.illuminationPercent ?? "—"}
                unit="%"
                digits={1}
              />
            </div>
            <div className="space-y-1 border-t border-outline-variant pt-2">
              <p className="flex items-center justify-between gap-2 font-mono text-label-sm text-on-surface-variant">
                Couverture DEM
                <span>{selected.dem.status === "FULL" ? `${selected.dem.resolutionM} m/px` : selected.dem.status}</span>
              </p>
              <p className="flex items-center justify-between gap-2 font-mono text-label-sm text-on-surface-variant">
                Illumination moyenne
                <span>{formatPercent(selected.illuminationPercent, 1)}</span>
              </p>
              <p className="flex items-center justify-between gap-2 font-mono text-label-sm text-on-surface-variant">
                Nuit continue max.
                <span>{selected.maxContinuousDarknessHours === null ? "—" : `${selected.maxContinuousDarknessHours} h`}</span>
              </p>
              <p className="text-body-sm text-on-surface-variant">
                La visibilité Soleil / Terre de référence est affichée sur la fiche détaillée.
              </p>
            </div>
            <Timestamp value={selected.referenceEphemerisUtc} />
            <div className="flex flex-col gap-1 border-t border-outline-variant pt-2">
              <Link href={`/catalogue/${selected.id}`}>
                <Button fullWidth variant="secondary" size="sm">Fiche détaillée</Button>
              </Link>
              <Link href={`/analyses/nouvelle?siteId=${selected.id}`}>
                <Button fullWidth size="sm">Lancer une analyse</Button>
              </Link>
            </div>
            <p className="text-body-sm text-on-surface-variant">
              Terre visible = visibilité géométrique, pas une garantie de liaison radio.
            </p>
          </CardBody>
        </Card>
      ) : null}
    </div>
  );
}
