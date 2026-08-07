import type { ExportFormat } from "@/lib/export/types";

export interface ExportHistoryEntry {
  id: string;
  timestamp: string; // ISO
  format: ExportFormat;
  templateLabel: string; // "Tax Report", "Custom export", "Scheduled backup", ...
  destination: string; // "Downloaded", "Emailed to x@y.com (demo)", "Google Sheets (demo)"
  count: number;
  total: number;
}

const STORAGE_KEY = "hourglass:export-history:v1";
const MAX_ENTRIES = 50;

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: ExportHistoryEntry[] | null = null;

function readFromStorage(): ExportHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries: ExportHistoryEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Best-effort.
  }
}

function readCache(): ExportHistoryEntry[] {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function commit(next: ExportHistoryEntry[]) {
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ExportHistoryEntry[] {
  return readCache();
}

export function getServerSnapshot(): ExportHistoryEntry[] {
  return [];
}

export function logExport(entry: Omit<ExportHistoryEntry, "id" | "timestamp">) {
  const record: ExportHistoryEntry = {
    ...entry,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  commit([record, ...readCache()].slice(0, MAX_ENTRIES));
}

export function clearHistory() {
  commit([]);
}
