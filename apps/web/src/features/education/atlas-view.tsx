"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Button, Card, CardBody, CardHeader, EmptyState, ErrorState, Icon, LoadingState, Metric, QualityBadge, Timestamp } from "@/components/ui";
import { PolarMap } from "@/components/lunar/polar-map";
import { useSite, useSites } from "@/hooks";
import { formatDegrees, formatPercent } from "@/lib/format";
import type { SiteSummary } from "@/types";
import { pedagogyForSite } from "./mock-data";

export function AtlasView() {
  const query = useSites();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [region, setRegion] = useState("SOUTH_POLE");
  const sites = useMemo(() => query.data ?? [], [query.data]);
  if (query.isPending) return <LoadingState label="Chargement de l'atlas pédagogique…" rows={5} />;
  if (query.isError) return <ErrorState message={query.error instanceof Error ? query.error.message : undefined} onRetry={() => void query.refetch()} />;
  const filtered = sites.filter((site) => {
    const latitude = site.coordinates.latitudeDeg;
    if (latitude === null) return region === "ALL";
    return region === "ALL" || (region === "SOUTH_POLE" && latitude < -60) || (region === "EQUATOR" && Math.abs(latitude) < 30);
  });
  const selected = filtered.find((site) => site.id === selectedId) ?? filtered[0];
  if (!selected) return <EmptyState title="Aucun site dans cette région" description="Sélectionnez une autre région pour parcourir les sites de démonstration." />;
  return <AtlasDetails key={selected.id} site={selected} onSelect={setSelectedId} region={region} onRegionChange={setRegion} sites={filtered} />;
}

function AtlasDetails({ site, onSelect, region, onRegionChange, sites }: { site: SiteSummary; onSelect: (id: string) => void; region: string; onRegionChange: (value: string) => void; sites: SiteSummary[] }) {
  const detailQuery = useSite(site.id);
  const lesson = pedagogyForSite(site);
  if (detailQuery.isPending) return <LoadingState label="Chargement de la fiche du site…" rows={5} />;
  if (detailQuery.isError) return <ErrorState message={detailQuery.error instanceof Error ? detailQuery.error.message : undefined} onRetry={() => void detailQuery.refetch()} />;
  const detail = detailQuery.data;
  if (!detail) return <EmptyState title="Détail du site indisponible" description="Réessayez ou choisissez un autre site." />;
  return <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]"><Card className="min-w-0"><CardHeader eyebrow="Atlas sélénographique · données de démonstration" title="Explorer les sites lunaires" icon={<Icon name="map" size={16} />} actions={<label className="font-mono text-label-sm text-on-surface-variant">Région <select className="ml-1 rounded border border-grid bg-container-high px-2 py-1 text-body-md text-on-surface" value={region} onChange={(event) => onRegionChange(event.target.value)}><option value="SOUTH_POLE">Pôle Sud (&lt; −60°)</option><option value="EQUATOR">Région équatoriale</option><option value="ALL">Toutes les régions</option></select></label>} /><CardBody className="space-y-2"><PolarMap sites={sites} selectedId={site.id} onSelect={onSelect} variant="full" /><ul className="grid gap-1 sm:grid-cols-2">{sites.map((item) => <li key={item.id}><button type="button" onClick={() => onSelect(item.id)} aria-pressed={item.id === site.id} className={`w-full rounded border p-2 text-left ${item.id === site.id ? "border-primary/60 bg-primary/10" : "border-grid hover:bg-container-high"}`}><span className="block text-body-md">{item.name}</span><span className="font-mono text-label-sm text-on-surface-variant">{formatDegrees(item.coordinates.latitudeDeg, 2)}° · {formatDegrees(item.coordinates.longitudeDeg, 2)}°</span></button></li>)}</ul></CardBody></Card><div className="space-y-3"><Card accent="primary"><CardHeader eyebrow="Fiche pédagogique" title={detail.name} icon={<Icon name="pin" size={16} />} actions={<QualityBadge value={detail.quality} />} /><CardBody className="space-y-2"><p className="font-mono text-label-sm text-on-surface-variant">{detail.designation} · {detail.mission}</p><p className="text-body-md text-on-surface-variant">{lesson.summary}</p><p className="rounded border border-primary/30 bg-primary/5 p-2 text-body-md">{lesson.challenge}</p><div className="grid grid-cols-2 gap-2"><Metric label="Latitude" value={formatDegrees(detail.coordinates.latitudeDeg, 3)} unit="°" /><Metric label="Longitude" value={formatDegrees(detail.coordinates.longitudeDeg, 3)} unit="°" /><Metric label="Altitude" value={detail.coordinates.altitudeM} unit="m" /><Metric label="Illumination moyenne" value={detail.illuminationPercent === null ? "—" : formatPercent(detail.illuminationPercent, 1)} /></div><div className="flex flex-wrap gap-1"><Badge tone={detail.dem.status === "FULL" ? "success" : "warning"}>DEM {detail.dem.status}{detail.dem.resolutionM !== null ? ` · ${detail.dem.resolutionM} m/px` : ""}</Badge><Badge tone="neutral">{detail.category}</Badge></div><Timestamp value={detail.referenceState.atUtc} /><p className="text-body-sm text-on-surface-variant">Source {detail.referenceState.source.source} · version {detail.referenceState.source.version}</p><Link href={`/exploration/sites/${detail.id}`}><Button fullWidth variant="secondary">Fiche pédagogique détaillée</Button></Link><Link href={`/catalogue/${detail.id}`} className="block text-center font-mono text-label-md text-primary hover:underline">Ouvrir la fiche technique</Link></CardBody></Card><Card><CardHeader eyebrow="Glossaire" title="Visibilité géométrique" icon={<Icon name="help-circle" size={16} />} /><CardBody className="space-y-2 text-body-md text-on-surface-variant"><p><strong className="text-on-surface">FULL</strong> : ligne de visée géométrique dégagée.</p><p><strong className="text-on-surface">PARTIAL</strong> : visibilité partielle selon le modèle.</p><p><strong className="text-on-surface">OCCULTED</strong> : astre masqué par le relief.</p><p><strong className="text-on-surface">UNKNOWN</strong> : visibilité non déterminée.</p><p>Terre visible = visibilité géométrique, pas une garantie de liaison radio.</p><p>Soleil visible ≠ énergie produite.</p><Link className="font-mono text-label-md text-primary hover:underline" href="/documentation">Hypothèses et limites</Link></CardBody></Card></div></div>;
}
