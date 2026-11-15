"use client";

import { useEffect, useRef, useState } from "react";
import { MoonHero } from "@/components/lunar/moon-hero";
import type { StoryStep } from "@/components/lunar/moon-scene";
import { cn } from "@/lib/cn";

const STEPS: { title: string; body: string; caption: string }[] = [
  {
    title: "Éclairage rasant",
    body: "Au pôle Sud, le Soleil reste bas sur l'horizon. L'illustration montre un terminateur net — lumière blanche directionnelle, ombres dures, sans atmosphère pour diffuser.",
    caption: "Soleil visible ≠ énergie produite",
  },
  {
    title: "Visibilité de la Terre",
    body: "Un point bleu marque la direction de la Terre. Ici, seule la géométrie compte : être au-dessus de l'horizon local n'implique aucune liaison radio.",
    caption: "Terre visible = visibilité géométrique, pas une garantie de liaison radio",
  },
  {
    title: "Comparer des sites",
    body: "Trois sites du pôle Sud peuvent partager la même fenêtre temporelle tout en offrant des profils d'illumination et de visibilité différents. La console compare ce que l'API a déjà calculé.",
    caption: "Illustration — non scientifique · données fournies par l'API",
  },
];

export function HomeStory() {
  const [step, setStep] = useState<StoryStep>(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = nodes.indexOf(visible.target as HTMLElement);
        if (index >= 0) setStep(index as StoryStep);
      },
      { rootMargin: "-30% 0px -40% 0px", threshold: [0.2, 0.5, 0.8] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <section className="border-b border-outline-variant bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-margin-mobile py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:gap-8 md:px-margin md:py-16">
        <div className="space-y-16 md:space-y-24 md:py-8">
          <header>
            <p className="font-mono text-[12px] uppercase tracking-wider text-primary">
              Trois questions
            </p>
            <h2 className="mt-2 font-heading text-headline-lg text-on-surface">
              Ce que la Lune doit montrer
            </h2>
            <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
              Un instrument d&apos;ingénieur : éclairage, visibilité terrestre, comparaison de
              sites — sans calcul dans le navigateur.
            </p>
          </header>
          {STEPS.map((item, index) => (
            <article
              key={item.title}
              ref={(el) => {
                refs.current[index] = el;
              }}
              className={cn(
                "scroll-mt-24 border border-outline-variant bg-container-low p-4 transition-colors",
                step === index ? "border-primary/50" : "border-outline-variant",
              )}
            >
              <p className="font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">
                0{index + 1}
              </p>
              <h3 className="mt-2 font-heading text-headline-sm text-on-surface">
                {item.title}
              </h3>
              <p className="mt-2 text-body-md text-on-surface-variant">{item.body}</p>
              <p className="mt-3 font-mono text-[12px] text-on-surface-variant">
                {item.caption}
              </p>
            </article>
          ))}
        </div>

        <div className="md:sticky md:top-20 md:h-[min(70vh,560px)]">
          <MoonHero
            storyStep={step}
            interactiveMarkers={false}
            className="h-[min(55vh,420px)] md:h-full"
          />
        </div>
      </div>
    </section>
  );
}
