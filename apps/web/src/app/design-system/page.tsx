import type { Metadata } from "next";

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
    <main className="mx-auto max-w-5xl px-margin-mobile py-xl md:px-margin">
      <p className="font-mono text-label-md uppercase tracking-widest text-primary">
        ARTEMIS PULSE / design system
      </p>
      <h1 className="mt-sm text-headline-xl font-heading">Tokens & composants de base</h1>
      <p className="mt-sm max-w-2xl text-body-md text-on-surface-variant">
        Source unique : frontmatter de DESIGN.md (couleurs, typographie, rayons,
        espacements) complété par la sémantique de visibilité et de qualité de calcul.
        Hiérarchie par couches de surface et bordures de 1 px — aucune ombre floue.
      </p>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Surfaces</h2>
        <div className="mt-md grid grid-cols-2 gap-md md:grid-cols-3">
          {surfaces.map((s) => (
            <div
              key={s.name}
              className="rounded border border-outline-variant p-md"
              style={{ backgroundColor: s.value }}
            >
              <p className="font-mono text-label-md text-on-surface">{s.name}</p>
              <p className="mt-xs font-mono text-label-sm text-on-surface-variant">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Accents</h2>
        <div className="mt-md flex flex-wrap gap-md">
          {accents.map((c) => (
            <div key={c.name} className="rounded border border-outline-variant p-md">
              <span
                aria-hidden
                className="mb-sm block h-10 w-24 rounded-sm"
                style={{ backgroundColor: c.value }}
              />
              <p className="font-mono text-label-md">{c.name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Sémantique de visibilité</h2>
        <div className="mt-md grid grid-cols-2 gap-md md:grid-cols-4">
          {semantic.map((c) => (
            <div key={c.name} className="rounded border border-outline-variant p-md">
              <span
                aria-hidden
                className="mb-sm block h-2 w-full rounded-sm"
                style={{ backgroundColor: c.value }}
              />
              <p className="font-mono text-label-md">{c.name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{c.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Échelle typographique</h2>
        <ul className="mt-md divide-y divide-outline-variant rounded border border-outline-variant">
          {typeScale.map((t) => (
            <li key={t.label} className="flex flex-wrap items-baseline justify-between gap-sm p-md">
              <span className={t.className}>142.35°</span>
              <span className="font-mono text-label-sm text-on-surface-variant">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Rayons & espacements</h2>
        <div className="mt-md flex flex-wrap items-end gap-md">
          {[
            ["sm", "0.125rem"],
            ["DEFAULT", "0.25rem"],
            ["md", "0.375rem"],
            ["lg", "0.5rem"],
            ["xl", "0.75rem"],
          ].map(([name, value]) => (
            <div key={name} className="rounded border border-outline-variant p-md">
              <div
                className="mb-sm h-12 w-12 border border-primary/50 bg-primary/10"
                style={{ borderRadius: value }}
              />
              <p className="font-mono text-label-sm">{name}</p>
              <p className="font-mono text-label-sm text-on-surface-variant">{value}</p>
            </div>
          ))}
        </div>
        <p className="mt-md text-body-sm text-on-surface-variant">
          Pas de base 4 px. Gouttière 16 px, marge 24 px desktop / 12 px mobile.
        </p>
      </section>

      <section className="mt-xl">
        <h2 className="text-headline-sm font-heading">Fond de données (démo)</h2>
        <p className="mt-sm text-body-sm text-on-surface-variant">
          Le bandeau « Données de démonstration » et la bannière d&apos;hypothèses sont
          décrits dans DESIGN.md (sections 3 et 4) et implémentés avec les composants UI.
        </p>
      </section>
    </main>
  );
}
