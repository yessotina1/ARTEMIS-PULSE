import { cn } from "@/lib/cn";
import type { HorizonSample } from "@/types";

/**
 * Profil d'horizon topographique 0° → 360°.
 * Affichage d'une série fournie par l'API — aucun calcul ici.
 */
export function HorizonProfileChart({
  samples,
  markers = [],
  height = 180,
  className,
  ariaLabel = "Profil d'horizon topographique de 0 à 360 degrés",
}: {
  samples: HorizonSample[];
  markers?: { azimuthDeg: number; label: string; tone?: "sun" | "earth" }[];
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  if (samples.length === 0) {
    return (
      <p className="rounded border border-grid bg-container-low p-md text-body-sm text-on-surface-variant">
        Profil d&apos;horizon indisponible pour ce site.
      </p>
    );
  }

  const width = 720;
  const padding = { top: 12, right: 12, bottom: 22, left: 28 };
  const minElevation = Math.min(-6, ...samples.map((s) => s.elevationDeg)) - 1;
  const maxElevation = Math.max(6, ...samples.map((s) => s.elevationDeg)) + 1;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const x = (azimuth: number) => padding.left + (azimuth / 360) * plotWidth;
  const y = (elevation: number) =>
    padding.top + plotHeight - ((elevation - minElevation) / (maxElevation - minElevation)) * plotHeight;

  const line = samples
    .map((sample, index) => `${index === 0 ? "M" : "L"}${x(sample.azimuthDeg).toFixed(1)},${y(sample.elevationDeg).toFixed(1)}`)
    .join(" ");

  const area = `${line} L${x(360).toFixed(1)},${y(minElevation).toFixed(1)} L${x(0).toFixed(1)},${y(minElevation).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={cn("w-full", className)}
    >
      <rect width={width} height={height} fill="#090e17" rx="2" />
      {[0, 90, 180, 270, 360].map((azimuth) => (
        <g key={azimuth}>
          <line
            x1={x(azimuth)}
            y1={padding.top}
            x2={x(azimuth)}
            y2={padding.top + plotHeight}
            stroke="#274060"
            strokeOpacity="0.7"
          />
          <text
            x={x(azimuth)}
            y={height - 6}
            textAnchor="middle"
            fontSize="12"
            className="fill-[#bcc9cd] font-mono"
          >
            {azimuth}°
          </text>
        </g>
      ))}
      {[0].map((elevation) => (
        <line
          key={elevation}
          x1={padding.left}
          y1={y(elevation)}
          x2={width - padding.right}
          y2={y(elevation)}
          stroke="#869397"
          strokeDasharray="3 3"
          strokeOpacity="0.8"
        />
      ))}
      <text x={4} y={y(0) - 4} fontSize="12" className="fill-[#bcc9cd] font-mono">
        0°
      </text>
      <text x={4} y={y(maxElevation) + 10} fontSize="12" className="fill-[#bcc9cd] font-mono">
        {maxElevation.toFixed(0)}°
      </text>
      <path d={area} fill="#4cd7f6" fillOpacity="0.12" />
      <path d={line} fill="none" stroke="#4cd7f6" strokeWidth="1.5" />
      {markers.map((marker) => (
        <g key={`${marker.label}-${marker.azimuthDeg}`}>
          <line
            x1={x(marker.azimuthDeg)}
            y1={padding.top}
            x2={x(marker.azimuthDeg)}
            y2={padding.top + plotHeight}
            stroke={marker.tone === "earth" ? "#adc6ff" : "#fbbf24"}
            strokeDasharray="4 3"
          />
          <circle
            cx={x(marker.azimuthDeg)}
            cy={padding.top + 6}
            r="3"
            fill={marker.tone === "earth" ? "#adc6ff" : "#fbbf24"}
          />
          <text
            x={x(marker.azimuthDeg) + 6}
            y={padding.top + 9}
            fontSize="12"
            className="fill-[#dee2f0] font-mono"
          >
            {marker.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
