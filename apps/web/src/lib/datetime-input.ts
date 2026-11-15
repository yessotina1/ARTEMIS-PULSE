/**
 * Conversions entre les champs `datetime-local` et les horodatages UTC de l'API.
 * L'interface est strictement UTC : la valeur saisie est interprétée comme UTC,
 * jamais comme heure locale du navigateur.
 */

export function toUtcIso(inputValue: string): string {
  if (!inputValue) return "";
  const withSeconds = inputValue.length === 16 ? `${inputValue}:00` : inputValue;
  return `${withSeconds}Z`;
}

export function fromUtcIso(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function countSteps(startUtc: string, endUtc: string, stepSeconds: number): number {
  const start = new Date(startUtc).getTime();
  const end = new Date(endUtc).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || stepSeconds <= 0) return 0;
  return Math.floor((end - start) / 1000 / stepSeconds) + 1;
}
