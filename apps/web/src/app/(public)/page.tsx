import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HomeHero } from "@/components/lunar/home-hero";
import { HomeStory } from "@/components/lunar/home-story";
import { MoonFallback } from "@/components/lunar/moon-fallback";
import {
  EducatorVignette,
  ExplorerVignette,
  PlannerVignette,
} from "@/components/lunar/space-vignettes";
import { AssumptionBanner, Button, Card, CardBody, CardHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "ARTEMIS PULSE — Visibilité lunaire au pôle Sud",
  description:
    "Planifiez la visibilité géométrique Soleil / Terre aux sites du pôle Sud lunaire : illumination, fenêtres de visibilité et qualité des calculs.",
};

const SPACES = [
  {
    title: "Planificateur",
    href: "/connexion",
    text: "Scénarios, chronologies UTC, comparaisons multi-sites et rapports — pour préparer une fenêtre d'atterrissage.",
    Vignette: PlannerVignette,
  },
  {
    title: "Éducateur",
    href: "/documentation",
    text: "Classes, quiz et activités guidées sans données personnelles : un pseudonyme et un code d'accès suffisent.",
    Vignette: EducatorVignette,
  },
  {
    title: "Explorateur",
    href: "/explorer",
    text: "Carte polaire et globe pour parcourir les sites du pôle Sud, avec la qualité DEM et les hypothèses affichées.",
    Vignette: ExplorerVignette,
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="min-h-[min(92vh,820px)] border-b border-outline-variant bg-container-lowest">
            <MoonFallback className="min-h-[420px]" />
          </div>
        }
      >
        <HomeHero />
      </Suspense>
      <Suspense fallback={<MoonFallback className="min-h-[320px]" />}>
        <HomeStory />
      </Suspense>

      <section className="border-b border-outline-variant bg-container-low">
        <div className="mx-auto max-w-6xl px-margin-mobile py-10 md:px-margin md:py-14">
          <p className="font-mono text-[12px] uppercase tracking-wider text-primary">
            Trois espaces
          </p>
          <h2 className="mt-2 font-heading text-headline-lg text-on-surface">
            Une console, trois usages
          </h2>
          <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
            Vignettes statiques — aucune scène 3D supplémentaire. Chaque espace s&apos;appuie sur les
            mêmes règles d&apos;affichage : UTC, unités, qualité et mentions scientifiques.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {SPACES.map(({ title, href, text, Vignette }) => (
              <Card key={title} className="flex flex-col overflow-hidden">
                <div className="h-36 border-b border-outline-variant bg-container-lowest">
                  <Vignette />
                </div>
                <CardHeader title={title} />
                <CardBody className="flex flex-1 flex-col gap-3">
                  <p className="text-body-md text-on-surface-variant">{text}</p>
                  <Link
                    href={href}
                    className="mt-auto font-mono text-[12px] text-primary hover:underline"
                  >
                    Ouvrir →
                  </Link>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-margin-mobile py-10 md:px-margin md:py-12">
        <h2 className="font-heading text-headline-lg text-on-surface">Sources et limites</h2>
        <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
          Le navigateur n&apos;effectue aucun calcul d&apos;éphéméride, d&apos;horizon ou de
          visibilité. La Lune de l&apos;accueil est une illustration.
        </p>
        <ul className="mt-4 space-y-2 border border-outline-variant bg-container-low p-4 text-body-md text-on-surface-variant">
          <li>
            <span className="text-on-surface">Terre visible</span> = visibilité géométrique, pas
            une garantie de liaison radio.
          </li>
          <li>
            <span className="text-on-surface">Soleil visible</span> ≠ énergie produite.
          </li>
        </ul>
        <div className="mt-4">
          <AssumptionBanner
            model="MOLA/LOLA DEM 20 m · éphémérides DE440 · réfraction nulle"
            source="SPICE / MOON_PA_DE440"
            version="2029.1"
            href="/documentation"
          />
        </div>
      </section>

      <section className="border-t border-outline-variant bg-container-low">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-margin-mobile py-8 md:px-margin">
          <div>
            <h2 className="font-heading text-headline-lg text-on-surface">
              Analyser un site du pôle Sud
            </h2>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Démonstration guidée, puis console planificateur.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/demo">
              <Button size="lg">Analyser un site</Button>
            </Link>
            <Link href="/inscription">
              <Button size="lg" variant="secondary">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
