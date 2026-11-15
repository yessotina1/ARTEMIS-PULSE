export type ClassValue = string | number | null | undefined | false;

/** Concatène des classes conditionnelles. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
