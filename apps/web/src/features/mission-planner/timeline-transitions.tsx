"use client";

import { cn } from "@/lib/cn";
import { formatUtc } from "@/lib/format";
import type { SeriesPoint, VisibilityWindow } from "@/types";

/** Marqueurs de transition cliquables : entrée / sortie de visibilité. */
export function TimelineTransitions({
  windows,
  points,
  onGoTo,
  className,
}: {
  windows: VisibilityWindow[];
  points: SeriesPoint[];
  onGoTo: (index: number) => void;
  className?: string;
}) {
  const transitions = windows
    .filter((window) => window.transition !== "PARTIAL")
    .slice(0, 10);

  function goTo(iso: string) {
    const index = points.findIndex((sample) => sample.atUtc === iso);
    if (index >= 0) onGoTo(index);
  }

  return (
    <div className={cn("border-t border-outline-variant pt-2", className)}>
      <p className="mb-1 font-mono text-label-sm uppercase text-on-surface-variant">
        Marqueurs de transition ({transitions.length})
      </p>
      {transitions.length === 0 ? (
        <p className="text-body-sm text-on-surface-variant">
          Aucune transition de visibilité sur cette fenêtre.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1">
          {transitions.map((window) => (
            <li key={`marker-${window.id}`}>
              <button
                type="button"
                onClick={() => goTo(window.startsAtUtc)}
                className="flex items-center gap-1 rounded-sm border border-outline-variant px-1 py-0.5 font-mono text-label-sm text-on-surface-variant transition-colors hover:border-primary/50 hover:text-on-surface"
                title={`${window.body === "SUN" ? "Soleil" : "Terre"} — ${
                  window.transition === "ENTER" ? "entrée en visibilité" : "sortie de visibilité"
                }`}
              >
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    window.transition === "ENTER" ? "bg-visibility-full" : "bg-visibility-occulted",
                  )}
                />
                {window.body === "SUN" ? "SOL" : "TERRE"}{" "}
                {window.transition === "ENTER" ? "ENTRÉE" : "SORTIE"} ·{" "}
                {formatUtc(window.startsAtUtc).slice(11, 16)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
