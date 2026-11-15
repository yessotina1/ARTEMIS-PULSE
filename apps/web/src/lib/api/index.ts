import { USE_MOCKS } from "@/lib/env";
import { httpApi } from "./http-api";
import { mockApi } from "./mock-api";
import type { ArtemisApi } from "./contract";

/** Point d'entrée unique du front vers l'API. */
export const api: ArtemisApi = USE_MOCKS ? mockApi : httpApi;

export { ApiClientError } from "./client";
export type { ArtemisApi, ComparisonRequest } from "./contract";
export { DEFAULT_CRITERIA, SOURCE } from "./mock-data";
