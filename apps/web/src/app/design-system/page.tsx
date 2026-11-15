import type { Metadata } from "next";
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
  Input,
  LoadingState,
  Metric,
  QualityBadge,
  Select,
  Timestamp,
  VisibilityBadge,
} from "@/components/ui";
import { InteractiveShowcase } from "@/components/dev/interactive-showcase";

export const metadata: Metadata = {
  title: "Design system",
  description: "Tokens, typographie et surfaces du design system ARTEMIS PULSE.",
};

const surfaces = [
  { name: "container-lowest", value: "#090e17", outline: "outline-variant" },
  { name: "surface", value: "#0f131d", outline: "outline-variant" },
  { name: "container-low", value: "#171c25", outline: "outline-variant" },
  { name: "container", value: "#1b2029", outline: "outline-variant" },
  { name: "container-high", value: "#252a34", outline: "outline-variant" },
  { name: "container-highest", value: "#30353f", outline: "outline" },
];

const accents = [
  { name: "primary", value: "#4cd7f6" },
  { name: "primary-container", value: "#06b6d4" },
  { name: "secondary", value: "#adc6ff" },
  { name: "tertiary", value: "#4edea3" },
  { name: "error", value: "#ffb4ab" },
];

const semantic = [
  { name: "FULL", value: "#10b981" },
  { name: "PARTIAL", value: "#f59e0b" },
  { name: "OCCULTED", value: "#ef4444" },
  { name: "UNKNOWN", value: "#64748b" },
];

const typeScale = [
  { className: "text-headline-xl font-heading", label: "headline-xl — Space Grotesk 32/40 700" },
  { className: "text-headline-lg font-heading", label: "headline-lg — Space Grotesk 24/32 600" },
  { className: "text-headline-sm font-heading", label: "headline-sm — Space Grotesk 18/24 600" },
  { className: "text-body-lg", label: "body-lg — Inter 15/22" },
  { className: "text-body-md", label: "body-md — Inter 13/18" },
  { className: "text-body-sm", label: "body-sm — Inter 12/16 (min. accessibilité)" },
  { className: "text-label-lg font-mono", label: "label-lg — JetBrains Mono 13/18" },
  { className: "text-label-md font-mono uppercase", label: "label-md — JetBrains Mono 12/16" },
  { className: "text-label-sm font-mono uppercase", label: "label-sm — JetBrains Mono 12/14" },
  { className: "text-data-display font-mono tabular", label: "data-display — JetBrains Mono 22/28" },
];

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-5xl px-margin-mobile py-8 md:px-margin">
      <p className="font-mono text-label-md uppercase tracking-widest text-primary">
        ARTEMIS PULSE / design system
      </p>
      <h1 className="mt-2 text-headline-xl font-heading">Tokens & composants de base</h1>
      <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
        Source unique : frontmatter de DESIGN.md (couleurs, typographie, rayons,
        espacements) complété par la sémantique de visibilité et de qualité de calcul.
        Hiérarchie par couches de surface et bordures de 1 px — aucune ombre floue.
      </p>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Surfaces</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
          {surfaces.map((s) => (
            <div
              key={s.name}
              className="rounded border border-outline-variant p-3"
              style={{ backgroundColor: s.value }}
            >
              <p className="font-mono text-label-md text-on-surface">{s.name}</p>
              <p className="mt-1 font-mono text-label-sm text-on-surface-variant">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Accents</h2>
        <div className="mt-3 flex flex-wrap gap-3">
          {accents.map((c) => (
            <div key={c.name} className="rounded border border-outline-variant p-3">
              <span
                aria-hidden
                className="mb-2 block h-10 w-24 rounded-sm"
                style={{ backgroundColor: c.value }}
              />
              <p className="font-mono text-label-md">{c.name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Sémantique de visibilité</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {semantic.map((c) => (
            <div key={c.name} className="rounded border border-outline-variant p-3">
              <span
                aria-hidden
                className="mb-2 block h-2 w-full rounded-sm"
                style={{ backgroundColor: c.value }}
              />
              <p className="font-mono text-label-md">{c.name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Échelle typographique</h2>
        <ul className="mt-3 divide-y divide-outline-variant rounded border border-outline-variant">
          {typeScale.map((t) => (
            <li key={t.label} className="flex flex-wrap items-baseline justify-between gap-2 p-3">
              <span className={t.className}>142.35°</span>
              <span className="font-mono text-label-sm text-on-surface-variant">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Rayons & espacements</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {[
            ["sm", "0.125rem"],
            ["DEFAULT", "0.25rem"],
            ["md", "0.375rem"],
            ["lg", "0.5rem"],
            ["xl", "0.75rem"],
          ].map(([name, value]) => (
            <div key={name} className="rounded border border-outline-variant p-3">
              <div
                className="mb-2 h-12 w-12 border border-primary/50 bg-primary/10"
                style={{ borderRadius: value }}
              />
              <p className="font-mono text-label-sm">{name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          Pas de base 4 px. Gouttière 16 px, marge 24 px desktop / 12 px mobile.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Boutons</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button>Lancer l&apos;analyse</Button>
          <Button variant="secondary">Hypothèses et limites</Button>
          <Button variant="ghost">Annuler</Button>
          <Button variant="danger">Supprimer</Button>
          <Button loading>Calcul en cours</Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Badges de visibilité</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <VisibilityBadge value="FULL" />
          <VisibilityBadge value="PARTIAL" />
          <VisibilityBadge value="OCCULTED" />
          <VisibilityBadge value="UNKNOWN" />
        </div>
        <h2 className="mt-5 text-headline-sm font-heading">Badges de qualité</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <QualityBadge value="VALIDATED" />
          <QualityBadge value="ESTIMATED" />
          <QualityBadge value="LOW" />
          <QualityBadge value="UNCOMPUTABLE" />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="primary">RIDGE</Badge>
          <Badge tone="neutral">MOLA</Badge>
          <Badge tone="success">T-0 NOMINAL</Badge>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Cartouches & métriques</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Card>
            <CardHeader eyebrow="Éphéméride #01" title="Visibilité du Soleil" />
            <CardBody className="grid grid-cols-2 gap-3">
              <Metric label="Azimut" value="142.35" unit="°" hint="S-SE" />
              <Metric label="Élévation" value="+1.84" unit="°" hint="Rasant" />
              <Metric label="Flux solaire" value={1361} unit="W/m²" />
              <Metric label="Illumination" value="42h 15m" />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Horodatage" eyebrow="UTC" />
            <CardBody className="space-y-2">
              <Timestamp value="2026-11-14T08:42:00Z" variant="block" />
              <Timestamp value="2026-11-14T08:42:00Z" />
              <p className="text-body-sm text-on-surface-variant">
                Format strict <span className="font-mono">YYYY-MM-DD HH:mm UTC</span>.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Champs" eyebrow="Formulaire" />
            <CardBody className="space-y-3">
              <Field label="Latitude" htmlFor="demo-lat" required hint="Entre -90° et +90°">
                <Input id="demo-lat" defaultValue="-89.7820" inputMode="decimal" />
              </Field>
              <Field label="Site" htmlFor="demo-site">
                <Select
                  id="demo-site"
                  options={[
                    { value: "shackleton", label: "Shackleton Rim" },
                    { value: "malapert", label: "Malapert Mountain" },
                  ]}
                />
              </Field>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Onglets & modale</h2>
        <div className="mt-3">
          <InteractiveShowcase />
        </div>
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-headline-sm font-heading">États</h2>
        <LoadingState rows={2} />
        <EmptyState
          title="Aucun scénario sauvegardé"
          description="Créez une analyse pour comparer des sites et des fenêtres temporelles."
        />
        <ErrorState
          title="Calcul indisponible"
          message="Le statut du run n'a pas pu être récupéré."
          code="RUN_STATUS_UNAVAILABLE"
          requestId="req_demo_001"
        />
      </section>

      <section className="mt-8">
        <h2 className="text-headline-sm font-heading">Bannière d&apos;hypothèses</h2>
        <div className="mt-3">
          <AssumptionBanner
            model="MOLA/LOLA DEM 20 m, Éphémérides DE440, réfraction nulle"
            source="SPICE / MOON_PA_DE440"
            version="2029.1"
            href="#"
          />
        </div>
      </section>
    </main>
  );
}
