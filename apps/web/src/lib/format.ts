/**
 * Formatage d'affichage — aucune science ici.
 * Règles : dates UTC `YYYY-MM-DD HH:mm UTC`, unités systématiques,
 * azimut dans [0, 360[, élévation signée.
 */

function toDate(value: string | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

const pad = (value: number) => String(value).padStart(2, "0");

/** `YYYY-MM-DD HH:mm UTC` */
export function formatUtc(value: string | Date): string {
  const date = toDate(value);
  if (!date) return "—";
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** `YYYY-MM-DD` */
export function formatUtcDate(value: string | Date): string {
  const date = toDate(value);
  return date ? date.toISOString().slice(0, 10) : "—";
}

/** `HH:mm` */
export function formatUtcTime(value: string | Date): string {
  const date = toDate(value);
  return date ? date.toISOString().slice(11, 16) : "—";
}

/** Horodatage compact pour les axes : `14:32` ou `03-15`. */
export function formatAxisTick(value: string, axis: "time" | "date" = "time"): string {
  const date = toDate(value);
  if (!date) return "";
  return axis === "time"
    ? date.toISOString().slice(11, 16)
    : `${date.toISOString().slice(8, 10)}/${date.toISOString().slice(5, 7)}`;
}

/** Azimut `[0, 360[` sur 3 entiers + une décimale : `035.12°`. */
export function formatAzimuth(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return "—";
  const normalized = ((degrees % 360) + 360) % 360;
  return `${normalized.toFixed(2).padStart(6, "0")}°`;
}

/** Élévation signée : `+6.42°` / `-01.4°`. */
export function formatElevation(degrees: number | null | undefined): string {
  if (degrees === null || degrees === undefined || Number.isNaN(degrees)) return "—";
  const rounded = degrees.toFixed(2);
  return `${degrees >= 0 ? "+" : ""}${rounded}°`;
}

/** Nombre tabulaire, virgule française. */
export function formatNumber(
  value: number | null | undefined,
  fractionDigits = 0,
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

/** Durée lisible `42h 15m`, `18h 30m`, `12 min`. */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "—";
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} min`;
  return `${hours}h ${pad(minutes)}m`;
}

/** Décalage horaire type `+25.5 h`. */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || Number.isNaN(hours)) return "—";
  return `${hours >= 0 ? "+" : ""}${hours.toFixed(1)} h`;
}

/** Degré décimal ou tiret si la coordonnée n'est pas connue. */
export function formatDegrees(value: number | null | undefined, digits = 4): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value.toFixed(digits)} %`;
}
