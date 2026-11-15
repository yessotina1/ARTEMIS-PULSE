"use client";

import { cn } from "@/lib/cn";
import type { SiteSummary } from "@/types";

type PolarMapProps = {
  sites: SiteSummary[];
  selectedId?: string | null;
  onSelect?: (siteId: string) => void;
  variant?: "preview" | "full";
  className?: string;
};

/**
 * Carte 2D polaire (projection stéréographique simplifiée du pôle Sud).
 * Représentation schématique d'affichage : aucune donnée scientifique calculée ici.
 */
export function PolarMap({ sites, selectedId, onSelect, variant = "preview", className }: PolarMapProps) {
  const size = 520;
  const center = size / 2;
  const maxRadius = size / 2 - 34;

  function project(latitudeDeg: number, longitudeDeg: number) {
    // Colatitude : le pôle Sud est au centre, l'équateur au bord.
    const colatitude = Math.max(0, Math.min(90, 90 + latitudeDeg));
    const radius = (colatitude / 90) * maxRadius;
    const angle = ((longitudeDeg - 90) * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  }

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="group"
        aria-label={`Projection polaire sud, ${sites.length} sites référencés`}
        className="w-full rounded border border-outline-variant bg-container-lowest"
      >
        <defs>
          <radialGradient id="polar-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0b2333" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#090e17" stopOpacity="1" />
          </radialGradient>
        </defs>
        <rect width={size} height={size} fill="url(#polar-glow)" />
        {[0.25, 0.5, 0.75, 1].map((ratio) => (
          <circle
            key={ratio}
            cx={center}
            cy={center}
            r={maxRadius * ratio}
            fill="none"
            stroke="#274060"
            strokeOpacity={ratio === 1 ? 0.9 : 0.5}
            strokeDasharray={ratio === 1 ? undefined : "2 4"}
          />
        ))}
        {[0, 45, 90, 135].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <line
              key={angle}
              x1={center - maxRadius * Math.cos(rad)}
              y1={center - maxRadius * Math.sin(rad)}
              x2={center + maxRadius * Math.cos(rad)}
              y2={center + maxRadius * Math.sin(rad)}
              stroke="#274060"
              strokeOpacity="0.5"
            />
          );
        })}
        <circle cx={center} cy={center} r="4" fill="#4cd7f6" />
        <text
          x={center}
          y={center - maxRadius - 14}
          textAnchor="middle"
          className={cn("fill-[#bcc9cd] font-mono text-[18px] lg:text-[12px]")}
        >
          0° MÉRIDIEN · VERS LA TERRE
        </text>

        {sites.map((site) => {
          if (site.coordinates.latitudeDeg === null || site.coordinates.longitudeDeg === null) return null;
          const point = project(site.coordinates.latitudeDeg, site.coordinates.longitudeDeg);
          const selected = site.id === selectedId;
          const unavailable = site.dem.status === "NONE";
          return (
            <g
              key={site.id}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              aria-label={`${site.name} — ${site.dem.status === "FULL" ? "couverture DEM complète" : "couverture DEM incomplète"}`}
              onClick={() => onSelect?.(site.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect?.(site.id);
                }
              }}
              className={onSelect ? "cursor-pointer" : undefined}
            >
              {selected ? (
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="12"
                  fill="none"
                  stroke="#4cd7f6"
                  strokeWidth="1.5"
                />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={selected ? 5 : 4}
                fill={unavailable ? "#64748b" : selected ? "#4cd7f6" : "#4edea3"}
              />
              {variant === "full" ? (
                <text
                  x={point.x + 9}
                  y={point.y + 4}
                  className={cn("fill-[#bcc9cd] font-mono text-[18px] lg:text-[12px]")}
                >
                  {site.name.split(" ")[0]}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 font-mono text-label-sm text-on-surface-variant">
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-2 rounded-full bg-tertiary" /> Site référencé
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-2 rounded-full bg-on-surface-variant" /> DEM absente
        </span>
        <span className="flex items-center gap-1">
          <span aria-hidden className="size-2 rounded-full border border-primary" /> Sélection
        </span>
      </div>
    </div>
  );
}
