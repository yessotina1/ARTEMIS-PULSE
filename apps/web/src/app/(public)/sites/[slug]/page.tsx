import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiClientError } from "@/lib/api";
import {
  AssumptionBanner,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Metric,
  PartialDataNotice,
  QualityBadge,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { formatDegrees, formatElevation } from "@/lib/format";
import type { SiteDetail } from "@/types";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export async function generateMetadata({
  params,
}: PageProps<"/sites/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  try {
    const site = await api.sites.get(slug);
    return {
      title: site.name,
      description: site.description,
    };
  } catch {
    return { title: "Site introuvable" };
  }
}

export default async function PublicSitePage({ params }: PageProps<"/sites/[slug]">) {
  const { slug } = await params;
  let site: SiteDetail;
  try {
    site = await api.sites.get(slug);
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <div className="border-b border-outline-variant bg-container-low">
        <div className="mx-auto max-w-6xl px-margin-mobile py-5 md:px-margin">
          <nav aria-label="Fil d'Ariane" className="mb-2">
            <ol className="flex items-center gap-1 font-mono text-label-sm text-on-surface-variant">
              <li>
                <Link href="/" className="hover:text-on-surface hover:underline">
                  Accueil
                </Link>
              </li>
              <li aria-hidden>
                <Icon name="chevron-right" size={12} />
              </li>
              <li aria-current="page">Fiche publique</li>
            </ol>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-label-md uppercase tracking-widest text-primary">
                {site.mission} · {site.designation}
              </p>
              <h1 className="mt-1 text-headline-xl font-heading">{site.name}</h1>
              <p className="mt-1 max-w-2xl text-body-lg text-on-surface-variant">
                {site.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge tone="primary">{site.category}</Badge>
                <QualityBadge value={site.quality} />
                <VisibilityBadge value={site.referenceState.sunVisibility} />
                <VisibilityBadge value={site.referenceState.earthVisibility} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Link href="/demo">
                <Button>Voir l&apos;analyse de démonstration</Button>
              </Link>
              <Link href="/connexion">
                <Button variant="secondary">Planifier sur ce site</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-3 px-margin-mobile py-5 md:px-margin">
        {site.dem.status !== "FULL" ? (
          <PartialDataNotice
            message={
              site.dem.status === "NONE"
                ? "Aucune couverture DEM pour ce site : la visibilité géométrique n'est pas calculable. Les valeurs affichées sont marquées UNKNOWN."
                : `Couverture DEM partielle (${site.dem.resolutionM ?? "?"} m/px). ${site.dem.note ?? ""}`
            }
          />
        ) : null}

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader
              eyebrow="Coordonnées géodésiques"
              title="Position et modèle de terrain"
              icon={<Icon name="pin" size={16} />}
            />
            <CardBody className="grid gap-3 sm:grid-cols-2">
              <Metric label="Latitude" value={formatDegrees(site.coordinates.latitudeDeg, 4)} unit="°" hint="Négative = hémisphère sud" />
              <Metric label="Longitude" value={formatDegrees(site.coordinates.longitudeDeg, 4)} unit="°" />
              <Metric label="Altitude MOLA" value={site.coordinates.altitudeM} unit="m" />
              <Metric
                label="Couverture DEM"
                value={
                  site.dem.status === "FULL"
                    ? `${site.dem.resolutionM ?? "—"} m/px`
                    : site.dem.status === "PARTIAL"
                      ? "Partielle"
                      : "Absente"
                }
              />
              <div className="sm:col-span-2 border-t border-outline-variant pt-2">
                <p className="font-mono text-label-sm uppercase text-on-surface-variant">
                  Éphéméride de référence
                </p>
                <Timestamp value={site.referenceEphemerisUtc} variant="block" className="mt-1" />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              eyebrow="Visibilité géométrique"
              title="Soleil et Terre"
              icon={<Icon name="sun" size={16} />}
            />
            <CardBody className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-label-md uppercase text-on-surface-variant">
                    <Icon name="sun" size={13} /> Soleil
                  </span>
                  <VisibilityBadge value={site.referenceState.sunVisibility} variant="compact" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Azimut" value={formatDegrees(site.referenceState.sun.azimuthDeg, 2)} unit="°" />
                  <Metric
                    label="Élévation"
                    value={formatElevation(site.referenceState.sun.elevationDeg)}
                    hint="Signée"
                  />
                </div>
                <p className="mt-1 font-mono text-label-sm text-on-surface-variant">
                  Flux incident : {site.referenceState.solarFluxWm2} W/m²
                </p>
              </div>
              <div className="border-t border-outline-variant pt-2">
                <div className="mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1 font-mono text-label-md uppercase text-on-surface-variant">
                    <Icon name="earth" size={13} /> Terre
                  </span>
                  <VisibilityBadge value={site.referenceState.earthVisibility} variant="compact" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Metric label="Azimut" value={formatDegrees(site.referenceState.earth.azimuthDeg, 2)} unit="°" />
                  <Metric
                    label="Élévation"
                    value={formatElevation(site.referenceState.earth.elevationDeg)}
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardBody>
              <Metric
                label="Illumination moyenne (14 j)"
                value={site.illuminationPercent ?? "—"}
                unit="%"
                digits={1}
                hint="Moyenne calculée par l'API"
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Metric
                label="Nuit continue maximale"
                value={site.maxContinuousDarknessHours ?? "—"}
                unit="h"
                digits={1}
              />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-1">
              <p className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant">
                Qualité du calcul
              </p>
              <QualityBadge value={site.quality} />
              <p className="text-body-sm text-on-surface-variant">
                Résultat produit par l&apos;API, affiché sans recalcul côté navigateur.
              </p>
            </CardBody>
          </Card>
        </div>

        <AssumptionBanner
          title="Hypothèses et limites"
          model={site.dem.source ?? "Couverture DEM indisponible"}
          source={site.referenceState.source.source}
          version={site.referenceState.source.version}
          limits={[
            "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
            "Soleil visible ≠ énergie produite",
            `Élévation solaire rasant (${formatElevation(site.referenceState.sun.elevationDeg)}) : rendement photovoltaïque fortement dépendant de l'incidence.`,
          ]}
          href="/documentation"
        />

        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-outline-variant bg-container-low p-3">
          <p className="text-body-sm text-on-surface-variant">
            Source {site.referenceState.source.source} · version {site.referenceState.source.version}.
            Résultat produit par l&apos;API, affiché sans recalcul côté navigateur.
          </p>
          <Link href="/inscription">
            <Button variant="secondary">Créer un scénario sur ce site</Button>
          </Link>
        </div>
      </div>
    </>
  );
}
