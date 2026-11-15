"use client";

import type { AuthSession, LoginInput, SignupInput } from "@/types";

/**
 * Authentification de démonstration : aucune requête réseau, session en
 * localStorage. À remplacer par l'API quand l'authentification sera branchée.
 */

const STORAGE_KEY = "artemis-pulse.session";

const DEMO_USER = {
  id: "usr-demo-001",
  email: "camille.roux@artemis-pulse.eu",
  fullName: "Camille Roux",
  organization: "Centre de planification polaire",
};

let cachedRaw: string | null = null;
let cachedSession: AuthSession | null = null;

/** Snapshot stable pour useSyncExternalStore. */
export function getSessionSnapshot(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSession = raw ? (JSON.parse(raw) as AuthSession) : null;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

export function getServerSessionSnapshot(): AuthSession | null {
  return null;
}

export function subscribeSession(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("artemis-auth-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("artemis-auth-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function readSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: AuthSession): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event("artemis-auth-change"));
}

export function clearSession(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("artemis-auth-change"));
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function signIn(input: LoginInput): Promise<AuthSession> {
  await wait(600);
  if (!input.email.includes("@")) {
    throw new Error("Adresse e-mail invalide.");
  }
  if (input.password.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
  }
  if (input.password === "motdepasse") {
    throw new Error("Identifiants incorrects. Vérifiez votre mot de passe.");
  }
  const session: AuthSession = {
    user: {
      ...DEMO_USER,
      email: input.email,
      profile: input.email.startsWith("educ") ? "EDUCATOR" : "PLANNER",
    },
    token: "demo-token",
  };
  writeSession(session);
  return session;
}

export async function signUp(input: SignupInput): Promise<AuthSession> {
  await wait(700);
  if (!input.email.includes("@")) throw new Error("Adresse e-mail invalide.");
  if (input.fullName.trim().length < 2) throw new Error("Indiquez votre nom complet.");
  if (input.password.length < 8) {
    throw new Error("Le mot de passe doit contenir au moins 8 caractères.");
  }
  const session: AuthSession = {
    user: {
      id: `usr-${Date.now().toString(36)}`,
      email: input.email,
      fullName: input.fullName,
      profile: input.profile,
      organization: "Organisation de démonstration",
    },
    token: "demo-token",
  };
  writeSession(session);
  return session;
}

export async function requestPasswordReset(email: string): Promise<void> {
  await wait(600);
  if (!email.includes("@")) throw new Error("Adresse e-mail invalide.");
}
