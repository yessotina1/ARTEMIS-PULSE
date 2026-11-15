/**
 * Configuration publique du front.
 * Les mocks sont actifs par défaut tant que l'API n'est pas branchée.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const DEMO_BANNER_LABEL = "Données de démonstration";
