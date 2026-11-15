"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type CSSProperties,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MoonFallback } from "@/components/lunar/moon-fallback";
import { HOME_MOON_SITES } from "@/components/lunar/moon-sites";
import type { StoryStep } from "@/components/lunar/moon-scene";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useWebGLAvailable } from "@/hooks/use-webgl-available";
import { cn } from "@/lib/cn";

const MoonScene = dynamic(
  () => import("@/components/lunar/moon-scene").then((m) => m.MoonScene),
  { ssr: false, loading: () => <MoonFallback /> },
);

function formatUtcClock(date: Date): string {
  const y = date.getUTCFullYear();
  const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const h = String(date.getUTCHours()).padStart(2, "0");
  const mi = String(date.getUTCMinutes()).padStart(2, "0");
  return `${y}-${mo}-${d} ${h}:${mi} UTC`;
}

function ReticleCorners() {
  const arm = "absolute h-3 w-3 border-primary/70";
  return (
    <>
      <span aria-hidden className={cn(arm, "top-2 left-2 border-t border-l")} />
      <span aria-hidden className={cn(arm, "top-2 right-2 border-t border-r")} />
      <span aria-hidden className={cn(arm, "bottom-2 left-2 border-b border-l")} />
      <span aria-hidden className={cn(arm, "right-2 bottom-2 border-r border-b")} />
    </>
  );
}

type MoonHeroProps = {
  className?: string;
  storyStep?: StoryStep | null;
  /** Affiche marqueurs HTML cliquables (hero uniquement). */
  interactiveMarkers?: boolean;
};

export function MoonHero({
  className,
  storyStep = null,
  interactiveMarkers = true,
}: MoonHeroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLAvailable();
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [utc, setUtc] = useState("");
  const [markerPos, setMarkerPos] = useState<Record<string, { x: number; y: number }>>(
    {},
  );
  const [, startTransition] = useTransition();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    mq.addEventListener("change", update);
    queueMicrotask(update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.05),
      { threshold: [0, 0.05, 0.2] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const tick = () => setUtc(formatUtcClock(new Date()));
    const start = window.setTimeout(tick, 0);
    if (reducedMotion) {
      return () => window.clearTimeout(start);
    }
    const id = window.setInterval(tick, 30_000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(id);
    };
  }, [reducedMotion]);

  const onMarkerScreenPositions = useCallback(
    (positions: Record<string, { x: number; y: number }>) => {
      startTransition(() => setMarkerPos(positions));
    },
    [startTransition],
  );

  const active = visible && tabVisible && webgl;

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full min-h-[360px] w-full overflow-hidden border border-outline-variant bg-container-lowest",
        className,
      )}
    >
      {webgl ? (
        <MoonScene
          active={active}
          reducedMotion={reducedMotion}
          mobile={mobile}
          storyStep={storyStep}
          showMarkers={interactiveMarkers && storyStep == null}
          onMarkerScreenPositions={
            interactiveMarkers && storyStep == null ? onMarkerScreenPositions : undefined
          }
          className="absolute inset-0"
        />
      ) : (
        <MoonFallback className="absolute inset-0" />
      )}

      <ReticleCorners />

      <div className="pointer-events-none absolute top-3 right-3 left-3 flex items-start justify-between gap-2">
        <p className="font-mono text-[12px] tracking-wide text-on-surface-variant">
          {utc}
        </p>
        <p className="max-w-[11rem] text-right font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">
          Illustration — non scientifique
        </p>
      </div>

      {interactiveMarkers && storyStep == null
        ? HOME_MOON_SITES.map((site) => {
            const pos = markerPos[site.id];
            if (!pos) return null;
            // Hors champ projeté
            if (pos.x < 8 || pos.y < 8 || pos.x > 10_000) return null;
            const style: CSSProperties = {
              left: pos.x,
              top: pos.y,
              transform: "translate(-50%, -50%)",
            };
            return (
              <Link
                key={site.id}
                href={`/sites/${site.slug}`}
                className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                style={style}
                aria-label={`${site.name}, ${site.latitudeDeg.toFixed(3)}°, ${site.longitudeDeg.toFixed(2)}°`}
              >
                <span className="relative grid size-4 place-items-center">
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:animate-none"
                  />
                  <span
                    aria-hidden
                    className="relative size-2.5 rounded-full border border-primary bg-primary"
                  />
                </span>
                <span className="border border-outline-variant bg-container-lowest/90 px-1.5 py-0.5 font-mono text-[12px] text-on-surface group-hover:border-primary">
                  {site.shortName}
                  <span className="mt-0.5 block text-on-surface-variant">
                    {site.latitudeDeg.toFixed(3)}° · {site.longitudeDeg.toFixed(2)}°
                  </span>
                </span>
              </Link>
            );
          })
        : null}
    </div>
  );
}
