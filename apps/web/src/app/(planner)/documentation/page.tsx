import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import {
  AssumptionBanner,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Icon,
  QualityBadge,
  VisibilityBadge,
} from "@/components/ui";

export const metadata: Metadata = { title: "Documentation" };

const VISIBILITY_ROWS = [
  { value: "FULL" as const, label: "Visibilité totale", detail: "Corps entièrement au-dessus de l'horizon topographique." },
  { value: "PARTIAL" as const, label: "Visibilité partielle", detail: "Corps partiellement masqué par le relief ou la pénombre." },
  { value: "OCCULTED" as const, label: "Masquée", detail: "Corps sous l'horizon local." },
  { value: "UNKNOWN" as const, label: "Indéterminée", detail: "Zone hors modèle DEM : aucun résultat fiable." },
];

const QUALITY_ROWS = [
  { value: "VALIDATED" as const, detail: "Ray-tracing d'horizon vérifié, couverture DEM complète." },
  { value: "ESTIMATED" as const, detail: "Interpolation sur une portion de l'horizon." },
  { value: "LOW" as const, detail: "Couverture DEM partielle, marge d'erreur élevée." },
  { value: "UNCOMPUTABLE" as const, detail: "Singularité ou couverture absente : aucun calcul." },
];

export default function DocumentationPage() {
  return (
    <>
      <PageHeader
        eyebrow="Documentation"
        title="Hypothèses et limites"
        description="Ce que le front affiche, ce qu'il ne calcule pas, et comment lire chaque indicateur."
      />

      <div className="space-y-md">
        <AssumptionBanner
          title="Cadre méthodologique"
          model="MOLA/LOLA DEM 20 m · éphémérides DE440 · réfraction nulle"
          source="SPICE / MOON_PA_DE440"
          version="2029.1"
          limits={[
            "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
            "Soleil visible ≠ énergie produite : le rendement dépend de l'incidence et de l'obstruction locale",
            "Les masques d'horizon et fenêtres d'occultation peuvent porter une incertitude supérieure à ±3,5° en couverture DEM partielle",
          ]}
        />

        <div className="grid gap-md lg:grid-cols-2">
          <Card>
            <CardHeader eyebrow="Lecture" title="Classes de visibilité" icon={<Icon name="globe" size={16} />} />
            <CardBody>
              <dl className="space-y-sm">
                {VISIBILITY_ROWS.map((row) => (
                  <div key={row.value} className="flex flex-wrap items-start justify-between gap-xs border-b border-outline-variant/50 pb-xs last:border-0">
                    <dt><VisibilityBadge value={row.value} /></dt>
                    <dd className="max-w-sm text-body-sm text-on-surface-variant">{row.detail}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader eyebrow="Confiance" title="Badges de qualité" icon={<Icon name="check-circle" size={16} />} />
            <CardBody>
              <dl className="space-y-sm">
                {QUALITY_ROWS.map((row) => (
                  <div key={row.value} className="flex flex-wrap items-start justify-between gap-xs border-b border-outline-variant/50 pb-xs last:border-0">
                    <dt><QualityBadge value={row.value} /></dt>
                    <dd className="max-w-sm text-body-sm text-on-surface-variant">{row.detail}</dd>
                  </div>
                ))}
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="grid gap-md lg:grid-cols-3">
          <Card>
            <CardBody className="space-y-xs">
              <p className="font-mono text-label-md uppercase text-primary">Le front calcule-t-il ?</p>
              <p className="text-body-sm text-on-surface-variant">
                Non. Éphémérides, horizon et visibilité sont produits par l&apos;API. Le front formate,
                trie et met en forme les valeurs reçues.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-xs">
              <p className="font-mono text-label-md uppercase text-primary">Horodatage</p>
              <p className="text-body-sm text-on-surface-variant">
                Toutes les dates sont en UTC au format <span className="font-mono">YYYY-MM-DD HH:mm UTC</span>.
                Les champs de saisie sont interprétés comme UTC, jamais comme heure locale.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-xs">
              <p className="font-mono text-label-md uppercase text-primary">Données de démonstration</p>
              <p className="text-body-sm text-on-surface-variant">
                Le bandeau « Données de démonstration » reste affiché tant que{" "}
                <span className="font-mono">NEXT_PUBLIC_USE_MOCKS=true</span>. Aucun appel n&apos;est
                effectué vers JPL Horizons ou les services NASA.
              </p>
              <Badge tone="neutral">Version des données 2029.1</Badge>
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
