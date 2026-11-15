import { cn } from "@/lib/cn";
import { formatElevation } from "@/lib/format";

/**
 * Vue schématique de la scène du site : horizon local, Soleil et Terre.
 * Simple mise en image des azimuts/élévations fournis par l'API.
 */
export function SiteScene({
  sun,
  earth,
  horizonElevationDeg = 0.8,
  className,
}: {
  sun: { azimuthDeg: number; elevationDeg: number; label?: string };
  earth: { azimuthDeg: number; elevationDeg: number; label?: string };
  horizonElevationDeg?: number;
  className?: string;
}) {
  const width = 560;
  const height = 260;
  const groundY = height - 52;
  const scale = 9;

  function marker(azimuthDeg: number, elevationDeg: number) {
    // Positionnement schématique : azimut relatif à la vue (150°), élévation × échelle.
    const relative = ((azimuthDeg - 150 + 540) % 360) - 180;
    const x = width / 2 + (relative / 180) * (width / 2 - 30);
    const y = Math.max(18, groundY - elevationDeg * scale);
    return { x, y };
  }

  const sunPoint = marker(sun.azimuthDeg, sun.elevationDeg);
  const earthPoint = marker(earth.azimuthDeg, earth.elevationDeg);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Scène du site : Soleil à ${formatElevation(sun.elevationDeg)}, Terre à ${formatElevation(earth.elevationDeg)} au-dessus de l'horizon`}
      className={cn("w-full", className)}
    >
      <rect width={width} height={height} fill="#090e17" />
      <path
        d={`M0 ${groundY} L60 ${groundY - 18} L120 ${groundY - 6} L180 ${groundY - 26} L240 ${groundY - 8} L300 ${groundY - 34} L360 ${groundY - 12} L430 ${groundY - 24} L500 ${groundY - 8} L560 ${groundY - 16} L560 ${height} L0 ${height} Z`}
        fill="#171c25"
        stroke="#274060"
      />
      <line
        x1="0"
        y1={groundY - horizonElevationDeg * scale}
        x2={width}
        y2={groundY - horizonElevationDeg * scale}
        stroke="#869397"
        strokeDasharray="4 4"
        strokeOpacity="0.8"
      />
      <text x="8" y={groundY - 6} fontSize="12" className="fill-[#bcc9cd] font-mono">
        HORIZON LOCAL {formatElevation(horizonElevationDeg)}
      </text>

      <line
        x1={sunPoint.x}
        y1={sunPoint.y}
        x2={sunPoint.x}
        y2={groundY}
        stroke="#fbbf24"
        strokeOpacity="0.5"
        strokeDasharray="2 3"
      />
      <circle cx={sunPoint.x} cy={sunPoint.y} r="7" fill="#fbbf24" />
      <text x={sunPoint.x + 12} y={sunPoint.y + 4} fontSize="12" className="fill-[#dee2f0] font-mono">
        SOLEIL {formatElevation(sun.elevationDeg)} · AZ {sun.azimuthDeg.toFixed(1)}°
      </text>

      <line
        x1={earthPoint.x}
        y1={earthPoint.y}
        x2={earthPoint.x}
        y2={groundY}
        stroke="#adc6ff"
        strokeOpacity="0.5"
        strokeDasharray="2 3"
      />
      <circle cx={earthPoint.x} cy={earthPoint.y} r="7" fill="#adc6ff" />
      <text x={earthPoint.x + 12} y={earthPoint.y + 4} fontSize="12" className="fill-[#dee2f0] font-mono">
        TERRE {formatElevation(earth.elevationDeg)} · AZ {earth.azimuthDeg.toFixed(1)}°
      </text>

      <text x="8" y={height - 10} fontSize="12" className="fill-[#869397] font-mono">
        VUE SCHÉMATIQUE · ÉCHELLE D&apos;ÉLÉVATION NON LINÉAIRE
      </text>
    </svg>
  );
}
