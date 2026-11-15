/** Sites illustrés sur la Lune d'accueil — données de démonstration, pas de calcul. */

export type MoonSiteMarker = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  /** Latitude lunaire affichée (mock), degrés. */
  latitudeDeg: number;
  /** Longitude lunaire affichée (mock), degrés. */
  longitudeDeg: number;
};

export const HOME_MOON_SITES: MoonSiteMarker[] = [
  {
    id: "site-shk-001",
    slug: "shackleton-rim-001",
    name: "Shackleton Rim Site 001",
    shortName: "Shackleton",
    latitudeDeg: -89.782,
    longitudeDeg: 124.32,
  },
  {
    id: "site-mlp-004",
    slug: "malapert-mountain-plateau",
    name: "Malapert Mountain Plateau",
    shortName: "Malapert",
    latitudeDeg: -84.9,
    longitudeDeg: 12.9,
  },
  {
    id: "site-crd-002",
    slug: "connecting-ridge",
    name: "Connecting Ridge",
    shortName: "Connecting Ridge",
    latitudeDeg: -89.44,
    longitudeDeg: 222.15,
  },
];

/** Convertit lat/lon en position cartésienne sur une sphère (illustration). */
export function latLonToPosition(
  latitudeDeg: number,
  longitudeDeg: number,
  radius: number,
): [number, number, number] {
  const lat = (latitudeDeg * Math.PI) / 180;
  const lon = (longitudeDeg * Math.PI) / 180;
  const cosLat = Math.cos(lat);
  return [
    radius * cosLat * Math.cos(lon),
    radius * Math.sin(lat),
    radius * cosLat * Math.sin(lon),
  ];
}
