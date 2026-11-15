import Link from "next/link";
import { DemoBanner, Icon } from "@/components/ui";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="mx-auto grid max-w-5xl gap-lg px-margin-mobile py-xl md:grid-cols-[1fr_400px] md:px-margin">
      <section className="hidden flex-col justify-between rounded border border-outline-variant bg-container-low p-lg md:flex">
        <div>
          <DemoBanner />
          <h2 className="mt-md text-headline-xl font-heading leading-tight">
            Planifier la visibilité lunaire,
            <br />
            sans ambiguïté.
          </h2>
          <p className="mt-sm max-w-md text-body-lg text-on-surface-variant">
            ARTEMIS PULSE expose la géométrie Soleil / Terre aux sites du pôle Sud : azimut,
            élévation, fenêtres d&apos;illumination et de visibilité terrestre, avec la qualité de
            chaque calcul.
          </p>
        </div>
        <ul className="mt-lg space-y-sm text-body-md text-on-surface-variant">
          {[
            "Chaque valeur affiche son unité et sa source.",
            "Classes de visibilité FULL / PARTIAL / OCCULTED / UNKNOWN.",
            "Aucun calcul scientifique dans le navigateur.",
          ].map((line) => (
            <li key={line} className="flex items-start gap-sm">
              <Icon name="check-circle" size={15} className="mt-0.5 shrink-0 text-tertiary" />
              {line}
            </li>
          ))}
        </ul>
        <p className="mt-lg border-t border-outline-variant pt-sm font-mono text-label-sm text-on-surface-variant">
          Terre visible = visibilité géométrique, pas une garantie de liaison radio · Soleil visible ≠
          énergie produite
        </p>
      </section>

      <section className="rounded border border-outline-variant bg-container p-md md:p-lg">
        <div className="mb-md">
          <p className="font-mono text-label-md uppercase tracking-widest text-primary">
            Espace planificateur
          </p>
          <h1 className="mt-xs text-headline-lg font-heading">{title}</h1>
          <p className="mt-xs text-body-md text-on-surface-variant">{subtitle}</p>
        </div>
        {children}
        {footer ? (
          <div className="mt-md border-t border-outline-variant pt-sm text-body-sm text-on-surface-variant">
            {footer}
          </div>
        ) : null}
        <p className="mt-md font-mono text-label-sm text-on-surface-variant">
          <Link href="/" className="text-primary hover:underline">
            Retour à l&apos;accueil public
          </Link>
        </p>
      </section>
    </div>
  );
}
