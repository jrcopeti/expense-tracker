import type { Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";
import { loadSettings, saveSettings } from "./storage";

type Listener = () => void;

const listeners = new Set<Listener>();
let cache: Settings | null = null;

function readCache(): Settings {
  if (cache === null) cache = loadSettings();
  return cache;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Settings {
  return readCache();
}

export function getServerSnapshot(): Settings {
  return DEFAULT_SETTINGS;
}

export function updateSettings(patch: Partial<Settings>): boolean {
  cache = { ...readCache(), ...patch };
  const persisted = saveSettings(cache);
  listeners.forEach((listener) => listener());
  return persisted;
}
