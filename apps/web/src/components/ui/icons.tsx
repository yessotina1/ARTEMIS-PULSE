import type { SVGProps } from "react";

export type IconName =
  | "sun"
  | "moon"
  | "earth"
  | "check"
  | "check-circle"
  | "alert-triangle"
  | "eye-off"
  | "help-circle"
  | "tilde"
  | "minus-circle"
  | "compass"
  | "clock"
  | "calendar"
  | "chevron-left"
  | "chevron-right"
  | "chevron-down"
  | "menu"
  | "close"
  | "search"
  | "plus"
  | "download"
  | "play"
  | "pause"
  | "grid"
  | "globe"
  | "layers"
  | "satellite"
  | "file"
  | "settings"
  | "book"
  | "info"
  | "user"
  | "logout"
  | "arrow-right"
  | "spark"
  | "sliders"
  | "chart"
  | "pin"
  | "map"
  | "target";

const paths: Record<IconName, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  earth: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.3 3.8 5.6 3.8 9S14.5 18.7 12 21c-2.5-2.3-3.8-5.6-3.8-9S9.5 5.3 12 3Z" />
    </>
  ),
  check: <path d="m4 12 5 5L20 6" />,
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17.2v.1" />
    </>
  ),
  "eye-off": (
    <>
      <path d="m3 3 18 18" />
      <path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c5 0 9 6 9 6a17 17 0 0 1-3.2 3.7M6.3 7.5A17.6 17.6 0 0 0 3 12s4 6 9 6a9.6 9.6 0 0 0 4.3-1" />
    </>
  ),
  "help-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.4M12 17.2v.1" />
    </>
  ),
  tilde: <path d="M3 14c3-6 6-6 9 0s6 6 9 0" />,
  "minus-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 12h9" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="1" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  "chevron-left": <path d="m15 5-7 7 7 7" />,
  "chevron-right": <path d="m9 5 7 7-7 7" />,
  "chevron-down": <path d="m5 9 7 7 7-7" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M5 5l14 14M19 5 5 19" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </>
  ),
  plus: <path d="M12 4v16M4 12h16" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 20h16" />,
  play: <path d="M7 4v16l13-8-13-8Z" />,
  pause: <path d="M8 4v16M16 4v16" />,
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm9 9-9 5-9-5m18 4-9 5-9-5" />,
  satellite: (
    <>
      <path d="m8 8 8 8M5 11l3-3 3 3-3 3-3-3Zm8 0 3-3 3 3-3 3-3-3Z" />
      <path d="M14 6V3M18 10h3M6 14H3M10 18v3" />
    </>
  ),
  file: (
    <>
      <path d="M6 3h8l5 5v13H6V3Z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  book: <path d="M4 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H4V4Zm16 0h-3a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H20V4Z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  logout: <path d="M10 4H4v16h6M15 8l4 4-4 4M9 12h10" />,
  "arrow-right": <path d="M4 12h16m0 0-6-6m6 6-6 6" />,
  spark: <path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z" />,
  sliders: <path d="M4 8h10m4 0h2M4 16h4m4 0h8M14 5v6M8 13v6" />,
  chart: <path d="M4 20V4m0 16h16M8 16V9m4 7V6m4 10v-4" />,
  pin: (
    <>
      <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  map: <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />,
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
    </>
  ),
};

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

/** Jeu d'icônes inline (aucune dépendance). Décoratif par défaut. */
export function Icon({ name, size = 16, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
