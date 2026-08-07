"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getSnapshot(): string {
  return window.location.hash.slice(1);
}

function getServerSnapshot(): string {
  return "";
}

/** The URL hash fragment (sans "#"), reactive to hashchange, hydration-safe via useSyncExternalStore. */
export function useLocationHash(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
