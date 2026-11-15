import { cn } from "@/lib/cn";

type MoonFallbackProps = {
  className?: string;
  label?: string;
};

/**
 * Repli statique au même cadrage que la scène 3D (Lune coupée à droite,
 * pôle Sud incliné vers le spectateur). Sans WebGL.
 */
export function MoonFallback({
  className,
  label = "Illustration — non scientifique",
}: MoonFallbackProps) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[320px] w-full overflow-hidden bg-container-lowest",
        className,
      )}
      role="img"
      aria-label="Illustration statique de la Lune vue du pôle Sud"
    >
      <svg
        viewBox="0 0 640 720"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id="moonDisk" cx="58%" cy="46%" r="42%">
            <stop offset="0%" stopColor="#9aa3b2" />
            <stop offset="55%" stopColor="#5c6574" />
            <stop offset="100%" stopColor="#1a1f28" />
          </radialGradient>
          <linearGradient id="terminator" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#090e17" stopOpacity="0.92" />
            <stop offset="42%" stopColor="#090e17" stopOpacity="0.55" />
            <stop offset="58%" stopColor="#090e17" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="640" height="720" fill="#090e17" />
        {/* Disque lunaire décalé à droite, coupé par le bord */}
        <circle cx="430" cy="340" r="280" fill="url(#moonDisk)" />
        <ellipse cx="360" cy="420" rx="70" ry="48" fill="#3a4250" opacity="0.55" />
        <ellipse cx="480" cy="260" rx="42" ry="30" fill="#4a5362" opacity="0.45" />
        <ellipse cx="520" cy="480" rx="55" ry="36" fill="#2e3542" opacity="0.5" />
        {/* Terminateur net */}
        <rect x="0" y="0" width="640" height="720" fill="url(#terminator)" />
        {/* Point Terre (bleu secondary) */}
        <circle cx="120" cy="110" r="3.5" fill="#adc6ff" />
        {/* Marqueurs cyan */}
        <g fill="#4cd7f6">
          <circle cx="400" cy="520" r="4" />
          <circle cx="455" cy="500" r="4" />
          <circle cx="430" cy="545" r="4" />
        </g>
      </svg>
      <span className="absolute bottom-3 left-3 font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
    </div>
  );
}
