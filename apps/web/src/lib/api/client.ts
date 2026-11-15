import { API_BASE_URL } from "@/lib/env";
import type { ApiErrorPayload } from "@/types";

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly details?: ApiErrorPayload["details"];
  readonly requestId: string;

  constructor(payload: Partial<ApiErrorPayload> & { status?: number }) {
    super(payload.message ?? "Erreur inattendue");
    this.name = "ApiClientError";
    this.code = payload.code ?? "UNKNOWN_ERROR";
    this.status = payload.status ?? 0;
    this.details = payload.details;
    this.requestId = payload.requestId ?? "req_unknown";
  }
}

const REQUEST_TIMEOUT_MS = 15_000;

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("artemis-pulse.session");
    const token = raw ? (JSON.parse(raw) as { token?: string }).token : undefined;
    return token && token !== "demo-token" ? { Authorization: `Token ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...authHeader(),
        ...init?.headers,
      },
    });

    const requestId = response.headers.get("x-request-id") ?? "req_unavailable";
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new ApiClientError({
        code: (body as ApiErrorPayload | null)?.code ?? `HTTP_${response.status}`,
        message:
          (body as ApiErrorPayload | null)?.message ??
          `Requête refusée par l'API (statut ${response.status}).`,
        details: (body as ApiErrorPayload | null)?.details,
        requestId: (body as ApiErrorPayload | null)?.requestId ?? requestId,
        status: response.status,
      });
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiClientError({
        code: "REQUEST_TIMEOUT",
        message: "Le serveur n'a pas répondu dans le délai imparti.",
        requestId: "req_timeout",
      });
    }
    throw new ApiClientError({
      code: "NETWORK_ERROR",
      message: "Impossible de joindre l'API ARTEMIS PULSE.",
      requestId: "req_network",
    });
  } finally {
    clearTimeout(timeout);
  }
}

export const http = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
