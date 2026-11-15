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
import { formatElevation, formatPercent } from "@/lib/format";

// Route bloquante : données de démonstration chargées côté serveur.
export const instant = false;

export const metadata: Metadata = {
  title: "ARTEMIS PULSE — Visibilité lunaire au pôle Sud",
  description:
    "Planifiez la visibilité géométrique Soleil / Terre aux sites du pôle Sud lunaire : illumination, fenêtres de visibilité et qualité des calculs.",
};

const FEATURES = [
  {
    icon: "sun" as const,
    title: "Illumination solaire",
    text: "Azimut, élévation signée et flux incident sur chaque pas de temps, avec le profil d'horizon local.",
  },
  {
    icon: "earth" as const,
    title: "Visibilité géométrique de la Terre",
    text: "Fenêtres où la Terre reste au-dessus de l'horizon topographique — sans hypothèse de liaison radio.",
  },
  {
    icon: "layers" as const,
    title: "Qualité et provenance",
    text: "VALIDÉ, ESTIMÉ, FAIBLE QUALITÉ ou NON CALCULABLE sur chaque résultat, avec source et version.",
  },
];

export default async function HomePage() {
  const sites = await api.sites.list({ region: "SOUTH_POLE" });
  const featured = sites.filter((site) => site.dem.status === "FULL").slice(0, 3);

  return (
    <>
      <section className="relative overflow-hidden border-b border-outline-variant bg-container-lowest">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(76,215,246,0.16), transparent 45%), radial-gradient(circle at 80% 0%, rgba(173,198,255,0.12), transparent 40%)",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl gap-lg px-margin-mobile py-xl md:grid-cols-[1.1fr_0.9fr] md:items-center md:px-margin md:py-2xl">
          <div>
            <div className="flex flex-wrap items-center gap-sm">
              <Badge tone="primary">Pôle Sud lunaire · 2030</Badge>
              <DemoBanner />
            </div>
            <h1 className="mt-md text-headline-xl font-heading leading-tight sm:text-5xl sm:leading-[1.1]">
              Savoir quand le Soleil et la Terre sont visibles,
              <span className="text-primary"> avant de poser.</span>
            </h1>
            <p className="mt-md max-w-xl text-body-lg text-on-surface-variant">
              ARTEMIS PULSE prépare les scénarios d&apos;observation des sites du pôle Sud :
              illumination, fenêtres de visibilité terrestre et qualité des données, sur un axe
              temporel strictement UTC.
            </p>
            <div className="mt-lg flex flex-wrap gap-sm">
              <Link href="/demo">
                <Button size="lg">
                  <Icon name="play" size={14} />
                  Voir l&apos;analyse de démonstration
                </Button>
              </Link>
              <Link href="/connexion">
                <Button size="lg" variant="secondary">
                  Ouvrir la console
                </Button>
              </Link>
            </div>
            <p className="mt-md font-mono text-label-sm text-on-surface-variant">
              Terre visible = visibilité géométrique, pas une garantie de liaison radio · Soleil
              visible ≠ énergie produite
            </p>
          </div>

          <Card level={3} className="bg-container/90">
            <CardHeader
              eyebrow="Site de référence"
              title="Shackleton Rim Site 001"
              icon={<Icon name="moon" size={16} />}
              actions={<QualityBadge value="VALIDATED" />}
            />
            <CardBody className="space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <Metric label="Azimut Soleil" value="142.35" unit="°" hint="S-SE" />
                <Metric label="Élévation Soleil" value="+1.84" unit="°" hint="Rasant" />
              </div>
              <div className="flex flex-wrap gap-xs">
                <VisibilityBadge value="FULL" />
                <Badge tone="neutral">Flux 1 361 W/m²</Badge>
                <Badge tone="neutral">Alt. +1 840 m</Badge>
              </div>
              <div className="border-t border-outline-variant pt-sm">
                <p className="font-mono text-label-sm uppercase text-on-surface-variant">
                  Éphéméride de référence
                </p>
                <Timestamp value="2030-01-01T12:00:00Z" variant="block" className="mt-xs" />
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Source SPICE / DE440 · MOLA/LOLA DEM 20 m · réfraction nulle.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-margin-mobile py-xl md:px-margin">
        <h2 className="text-headline-lg font-heading">Une console de visibilité, pas un simulateur</h2>
        <p className="mt-xs max-w-2xl text-body-md text-on-surface-variant">
          Le navigateur affiche ce que l&apos;API renvoie. Aucun calcul d&apos;éphéméride, d&apos;horizon
          ou de visibilité n&apos;est effectué côté front.
        </p>
        <div className="mt-md grid gap-md md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardBody className="space-y-sm">
                <span className="grid size-9 place-items-center rounded border border-primary/30 bg-primary/10 text-primary">
                  <Icon name={feature.icon} size={18} />
                </span>
                <h3 className="text-headline-sm font-heading">{feature.title}</h3>
                <p className="text-body-md text-on-surface-variant">{feature.text}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-margin-mobile pb-xl md:px-margin">
        <div className="flex flex-wrap items-end justify-between gap-sm">
          <div>
            <h2 className="text-headline-lg font-heading">Sites du pôle Sud</h2>
            <p className="mt-xs text-body-md text-on-surface-variant">
              Couverture DEM complète, qualité de calcul validée.
            </p>
          </div>
          <Link href="/connexion" className="font-mono text-label-md text-primary hover:underline">
            Ouvrir le catalogue complet →
          </Link>
        </div>
        <div className="mt-md grid gap-md md:grid-cols-3">
          {featured.map((site) => (
            <Card key={site.id} className="flex flex-col">
              <CardHeader
                eyebrow={site.designation}
                title={site.name}
                actions={<QualityBadge value={site.quality} />}
              />
              <CardBody className="flex flex-1 flex-col gap-sm">
                <p className="font-mono text-label-md text-on-surface-variant">
                  {site.coordinates.latitudeDeg.toFixed(4)}° · {site.coordinates.longitudeDeg.toFixed(4)}° ·{" "}
                  {site.coordinates.altitudeM} m
                </p>
                <div className="grid grid-cols-2 gap-sm">
                  <Metric
                    label="Illumination"
                    value={site.illuminationPercent ?? "—"}
                    unit="%"
                    digits={1}
                  />
                  <Metric
                    label="Nuit max."
                    value={site.maxContinuousDarknessHours ?? "—"}
                    unit="h"
                    digits={1}
                  />
                </div>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-xs border-t border-outline-variant pt-sm">
                  <Badge tone="neutral">DEM {site.dem.resolutionM} m/px</Badge>
                  <Link
                    href={`/sites/${site.slug}`}
                    className="font-mono text-label-md text-primary hover:underline"
                  >
                    Fiche publique →
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-margin-mobile pb-xl md:px-margin">
        <AssumptionBanner
          model="MOLA/LOLA DEM 20 m · éphémérides DE440 · réfraction nulle"
          source="SPICE / MOON_PA_DE440"
          version="2029.1"
          href="/documentation"
        />
      </section>

      <section className="border-t border-outline-variant bg-container-low">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-md px-margin-mobile py-xl md:px-margin">
          <div>
            <h2 className="text-headline-lg font-heading">
              Prêt à comparer des fenêtres d&apos;atterrissage ?
            </h2>
            <p className="mt-xs text-body-md text-on-surface-variant">
              Créez un scénario, lancez le calcul, comparez jusqu&apos;à quatre sites.
            </p>
          </div>
          <Link href="/inscription">
            <Button size="lg">Créer un compte planificateur</Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-margin-mobile py-lg md:px-margin">
        <p className="font-mono text-label-sm text-on-surface-variant">
          Dernière synchronisation des données de démonstration :{" "}
          {formatElevation(-0.42)} sous l&apos;horizon local au site de référence · illumination{" "}
          {formatPercent(86.4, 1)}.
        </p>
      </section>
    </>
  );
}
