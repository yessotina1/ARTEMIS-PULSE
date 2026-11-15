"use client";

import Link from "next/link";
import { MoonHero } from "@/components/lunar/moon-hero";
import { Button, DemoBanner } from "@/components/ui";

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant bg-container-lowest">
      <div className="relative mx-auto grid min-h-[min(92vh,820px)] max-w-6xl md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)]">
        {/* Texte à gauche — dégradé surface → transparent pour le contraste */}
        <div className="relative z-10 flex flex-col justify-center px-margin-mobile py-10 md:px-margin md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-linear-to-r from-container-lowest via-container-lowest/90 to-transparent md:from-container-lowest md:via-container-lowest/85 md:to-transparent"
          />
          <div className="relative max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <DemoBanner />
            </div>
            <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.14em] text-primary">
              ARTEMIS PULSE
            </p>
            <h1
              className="mt-3 font-heading font-bold tracking-[-0.03em] text-on-surface"
              style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.05 }}
            >
              Voir le pôle Sud
              <span className="block text-on-surface">avant de poser.</span>
            </h1>
            <p className="mt-4 max-w-md text-body-lg text-on-surface-variant">
              Console de visibilité géométrique Soleil / Terre pour les sites lunaires — instrument
              d&apos;ingénieur, pas un simulateur décoratif.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/demo">
                <Button size="lg">Analyser un site</Button>
              </Link>
              <Link href="/explorer">
                <Button size="lg" variant="secondary">
                  Explorer la Lune
                </Button>
              </Link>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[12px] text-on-surface-variant">
              <Link href="/documentation" className="hover:text-primary hover:underline">
                Apprendre
              </Link>
              <Link href="/inscription" className="hover:text-primary hover:underline">
                Lancer une mission
              </Link>
            </div>
          </div>
        </div>

        {/* Lune à droite, coupée par le bord */}
        <div className="relative min-h-[420px] md:min-h-0">
          <div className="absolute inset-0 md:-right-8 md:left-[-8%]">
            <MoonHero className="h-full min-h-[420px] border-0 md:min-h-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
