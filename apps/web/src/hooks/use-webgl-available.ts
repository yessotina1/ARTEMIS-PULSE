"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => undefined;
}

function getWebGLSnapshot(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

/** `null` n'est plus nécessaire : false côté serveur, détection synchrone côté client. */
export function useWebGLAvailable(): boolean {
  return useSyncExternalStore(subscribe, getWebGLSnapshot, getServerSnapshot);
}
