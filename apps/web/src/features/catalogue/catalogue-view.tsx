"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  ErrorState,
  Field,
  Icon,
  Input,
  LoadingState,
  Metric,
  QualityBadge,
  Select,
} from "@/components/ui";
import { PolarMap } from "@/components/lunar/polar-map";
import { useSites } from "@/hooks";
import { formatPercent } from "@/lib/format";
import type { SiteCategory, SiteSummary } from "@/types";

const CATEGORY_OPTIONS = [
  { value: "ALL", label: "Toutes les catégories" },
  { value: "RIDGE", label: "Crête" },
  { value: "PLATEAU", label: "Plateau" },
  { value: "CRATER_RIM", label: "Bord de cratère" },
  { value: "PSR", label: "PSR" },
  { value: "HISTORIC", label: "Historique" },
  { value: "CUSTOM", label: "Personnalisé" },
];

const DEM_OPTIONS = [
  { value: "ALL", label: "Toutes les couvertures" },
  { value: "FULL", label: "Complète" },
  { value: "PARTIAL", label: "Partielle" },
  { value: "NONE", label: "Absente" },
];

const CATEGORY_LABELS: Record<SiteCategory, string> = {
  RIDGE: "Crête",
  PLATEAU: "Plateau",
  CRATER_RIM: "Bord de cratère",
  PSR: "PSR",
  HISTORIC: "Historique",
  CUSTOM: "Personnalisé",
};

export function CatalogueView() {
  const sitesQuery = useSites();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [dem, setDem] = useState("ALL");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sites = useMemo(() => sitesQuery.data ?? [], [sitesQuery.data]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return sites.filter((site) => {
      const matchesSearch =
        needle.length === 0 ||
        site.name.toLowerCase().includes(needle) ||
        site.designation.toLowerCase().includes(needle) ||
        site.tags.some((tag) => tag.toLowerCase().includes(needle));
      const matchesCategory = category === "ALL" || site.category === category;
      const matchesDem = dem === "ALL" || site.dem.status === dem;
      return matchesSearch && matchesCategory && matchesDem;
    });
  }, [sites, search, category, dem]);

  const selected = sites.find((site) => site.id === selectedId) ?? filtered[0] ?? null;
  const southPole = sites.filter((site) => site.coordinates.latitudeDeg < -60);

  if (sitesQuery.isPending) return <LoadingState label="Chargement du catalogue…" rows={6} />;
  if (sitesQuery.isError) {
    return (
      <ErrorState
        message={sitesQuery.error instanceof Error ? sitesQuery.error.message : undefined}
        onRetry={() => void sitesQuery.refetch()}
      />
    );
  }

  return (
    <div className="space-y-md">
      <Card>
        <CardBody className="grid gap-sm md:grid-cols-[1.6fr_1fr_1fr]">
          <Field label="Rechercher" htmlFor="catalogue-search">
            <Input
              id="catalogue-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom de cratère, identifiant ou coordonnée"
            />
          </Field>
          <Field label="Catégorie" htmlFor="catalogue-category">
            <Select
              id="catalogue-category"
              options={CATEGORY_OPTIONS}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            />
          </Field>
          <Field label="Couverture DEM" htmlFor="catalogue-dem">
            <Select
              id="catalogue-dem"
              options={DEM_OPTIONS}
              value={dem}
              onChange={(event) => setDem(event.target.value)}
            />
          </Field>
        </CardBody>
        <div className="flex flex-wrap items-center justify-between gap-sm border-t border-outline-variant px-md py-xs">
          <p className="font-mono text-label-sm text-on-surface-variant" role="status">
            {filtered.length} site(s) affiché(s) sur {sites.length} · {southPole.length} au pôle Sud
          </p>
          <Link href="/analyses/nouvelle">
            <Button size="sm" variant="secondary">
              <Icon name="plus" size={13} />
              Lancer une analyse
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid gap-md xl:grid-cols-[1.6fr_1fr]">
        <Card className="min-w-0">
          <CardHeader
            eyebrow="Catalogue IAU / NASA LRO"
            title="Sites & balises géodésiques"
            icon={<Icon name="layers" size={16} />}
            actions={<Badge tone="neutral">Éphéméride 2030-01-01 12:00 UTC</Badge>}
          />
          {filtered.length === 0 ? (
            <CardBody>
              <EmptyState
                icon="search"
                title="Aucun site ne correspond aux filtres"
                description="Modifiez la recherche ou réinitialisez les filtres de couverture."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setSearch("");
                      setCategory("ALL");
                      setDem("ALL");
                    }}
                  >
                    Réinitialiser les filtres
                  </Button>
                }
              />
            </CardBody>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">Sites lunaires du catalogue</caption>
                <thead>
                  <tr className="border-b border-outline-variant font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
                    <th scope="col" className="px-md py-xs font-medium">Site & désignation</th>
                    <th scope="col" className="px-md py-xs font-medium">Coordonnées</th>
                    <th scope="col" className="hidden px-md py-xs font-medium lg:table-cell">Mission</th>
                    <th scope="col" className="px-md py-xs font-medium">Qualité</th>
                    <th scope="col" className="px-md py-xs font-medium">DEM</th>
                    <th scope="col" className="hidden px-md py-xs font-medium md:table-cell">Illum.</th>
                    <th scope="col" className="px-md py-xs font-medium">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((site) => (
                    <SiteRow
                      key={site.id}
                      site={site}
                      selected={site.id === selected?.id}
                      onSelect={() => setSelectedId(site.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-md">
          <Card>
            <CardHeader
              eyebrow="Projection polaire sud (> 80° S)"
              title="Cartographie de sélection"
              icon={<Icon name="compass" size={16} />}
              actions={<Badge tone="neutral">Stéréo DE440</Badge>}
            />
            <CardBody>
              <PolarMap sites={southPole} selectedId={selected?.id} onSelect={setSelectedId} />
            </CardBody>
          </Card>

          {selected ? <SiteInspection site={selected} /> : null}

          <AssumptionBanner
            title="Limites du catalogue"
            compact
            model="MOLA/LOLA DEM 20 m · éphémérides DE440"
            source="SPICE / MOON_PA_DE440"
            version="2029.1"
            limits={[
              "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
              "Une couverture DEM partielle rend les fenêtres d'occultation estimées.",
            ]}
            href="/documentation"
          />
        </div>
      </div>
    </div>
  );
}

function SiteRow({
  site,
  selected,
  onSelect,
}: {
  site: SiteSummary;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <tr
      className={`cursor-pointer border-b border-outline-variant/50 text-body-md transition-colors last:border-0 ${
        selected ? "bg-primary/10" : "hover:bg-container-high"
      }`}
      onClick={onSelect}
    >
      <td className="px-md py-xs">
        <div className="flex items-start gap-xs">
          <span aria-hidden className={`mt-1.5 size-1.5 shrink-0 rounded-full ${site.dem.status === "NONE" ? "bg-on-surface-variant" : "bg-tertiary"}`} />
          <div>
            <Link
              href={`/catalogue/${site.id}`}
              onClick={(event) => event.stopPropagation()}
              className="block text-on-surface hover:text-primary hover:underline"
            >
              {site.name}
            </Link>
            <p className="font-mono text-label-sm text-on-surface-variant">{site.designation}</p>
            <p className="text-body-sm text-on-surface-variant">{CATEGORY_LABELS[site.category]}</p>
          </div>
        </div>
      </td>
      <td className="px-md py-xs font-mono text-label-md tabular text-on-surface-variant">
        {site.coordinates.latitudeDeg.toFixed(4)}°<br />
        {site.coordinates.longitudeDeg.toFixed(4)}°
        <br />
        <span className="text-label-sm">Alt. {site.coordinates.altitudeM} m</span>
      </td>
      <td className="hidden px-md py-xs text-body-sm text-on-surface-variant lg:table-cell">
        {site.mission}
      </td>
      <td className="px-md py-xs"><QualityBadge value={site.quality} /></td>
      <td className="px-md py-xs">
        {site.dem.status === "FULL" ? (
          <Badge tone="success">{site.dem.resolutionM} m/px</Badge>
        ) : site.dem.status === "PARTIAL" ? (
          <Badge tone="warning">Partielle</Badge>
        ) : (
          <Badge tone="danger">Absente</Badge>
        )}
      </td>
      <td className="hidden px-md py-xs font-mono text-label-md tabular md:table-cell">
        {site.illuminationPercent === null ? "—" : formatPercent(site.illuminationPercent, 1)}
      </td>
      <td className="px-md py-xs">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect();
          }}
          aria-label={`Inspecter ${site.name}`}
          className="rounded border border-grid p-xs text-on-surface-variant hover:border-primary/50 hover:text-primary"
        >
          <Icon name="search" size={13} />
        </button>
      </td>
    </tr>
  );
}

function SiteInspection({ site }: { site: SiteSummary }) {
  return (
    <Card accent={site.dem.status === "FULL" ? "primary" : "partial"}>
      <CardHeader
        eyebrow="Inspection du site sélectionné"
        title={site.name}
        icon={<Icon name="pin" size={16} />}
        actions={<QualityBadge value={site.quality} />}
      />
      <CardBody className="space-y-sm">
        <p className="font-mono text-label-sm text-on-surface-variant">
          {site.designation} · classe {CATEGORY_LABELS[site.category]}
        </p>
        <div className="grid grid-cols-2 gap-sm">
          <Metric label="Latitude" value={site.coordinates.latitudeDeg.toFixed(4)} unit="°" />
          <Metric label="Longitude" value={site.coordinates.longitudeDeg.toFixed(4)} unit="°" />
          <Metric label="Altitude" value={site.coordinates.altitudeM} unit="m" />
          <Metric
            label="Illumination moyenne"
            value={site.illuminationPercent ?? "—"}
            unit="%"
            digits={1}
          />
        </div>
        {site.dem.status !== "FULL" ? (
          <p className="rounded border border-quality-low/40 bg-quality-low-soft/20 px-sm py-xs text-body-sm text-quality-low">
            <Icon name="alert-triangle" size={13} className="mr-1 inline" />
            {site.dem.status === "PARTIAL"
              ? `Couverture DEM partielle (${site.dem.resolutionM ?? "?"} m/px) : fenêtres d'occultation estimées.`
              : "Aucune couverture DEM : la visibilité n'est pas calculable pour ce site."}
          </p>
        ) : (
          <p className="font-mono text-label-sm text-on-surface-variant">
            Couverture DEM complète — résolution {site.dem.resolutionM} m/px.
          </p>
        )}
        <div className="flex flex-wrap gap-sm border-t border-outline-variant pt-sm">
          <Link href={`/catalogue/${site.id}`}>
            <Button size="sm">Fiche détaillée</Button>
          </Link>
          <Link href={`/analyses/nouvelle?siteId=${site.id}`}>
            <Button size="sm" variant="secondary">Lancer une analyse</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
