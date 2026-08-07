import type { Expense } from "@/lib/types";
import type { ExportFormat } from "@/lib/export/types";
import type { ConnectionId } from "./types";
import { runExport } from "@/lib/export/runExport";
import { logExport } from "./historyStore";
import { touchSync } from "./connectionsStore";

export type ScheduleFrequency = "daily" | "weekly" | "monthly";
export type ScheduleDestination = ConnectionId | "download";

export interface BackupSchedule {
  enabled: boolean;
  frequency: ScheduleFrequency;
  format: ExportFormat;
  destination: ScheduleDestination;
  nextRunAt: string | null; // ISO
  lastRunAt: string | null;
}

const STORAGE_KEY = "hourglass:backup-schedule:v1";

const DEFAULT_SCHEDULE: BackupSchedule = {
  enabled: false,
  frequency: "weekly",
  format: "csv",
  destination: "download",
  nextRunAt: null,
  lastRunAt: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: BackupSchedule | null = null;

function readFromStorage(): BackupSchedule {
  if (typeof window === "undefined") return DEFAULT_SCHEDULE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCHEDULE;
    return { ...DEFAULT_SCHEDULE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SCHEDULE;
  }
}

function persist(state: BackupSchedule) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort.
  }
}

function readCache(): BackupSchedule {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function commit(next: BackupSchedule) {
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): BackupSchedule {
  return readCache();
}

export function getServerSnapshot(): BackupSchedule {
  return DEFAULT_SCHEDULE;
}

export function computeNextRun(frequency: ScheduleFrequency, from: Date = new Date()): string {
  const next = new Date(from);
  if (frequency === "daily") next.setDate(next.getDate() + 1);
  else if (frequency === "weekly") next.setDate(next.getDate() + 7);
  else next.setMonth(next.getMonth() + 1);
  return next.toISOString();
}

export function updateSchedule(patch: Partial<Omit<BackupSchedule, "nextRunAt" | "lastRunAt">>) {
  const current = readCache();
  const next = { ...current, ...patch };
  // Turning the schedule on (or changing its cadence) resets the countdown from now.
  if (patch.enabled || patch.frequency) {
    next.nextRunAt = next.enabled ? computeNextRun(next.frequency) : current.nextRunAt;
  }
  if (patch.enabled === false) next.nextRunAt = null;
  commit(next);
}

/**
 * The honest version of "background" scheduling for a client-only app: there
 * is no server, so nothing runs while the tab is closed. Instead, every time
 * Hourglass loads, this checks whether a scheduled run is overdue and - if
 * so - actually performs it right now (a real download, a real history
 * entry), then reschedules. Copy in the UI says "next time you open
 * Hourglass" specifically so this isn't overstated as true background sync.
 */
export async function runDueBackupIfNeeded(expenses: Expense[]): Promise<boolean> {
  const schedule = readCache();
  if (!schedule.enabled || !schedule.nextRunAt) return false;
  if (new Date(schedule.nextRunAt).getTime() > Date.now()) return false;

  const result = await runExport(expenses, {
    format: schedule.format,
    filters: { startDate: "", endDate: "", categories: "all" },
    filename: `hourglass-scheduled-backup-${new Date().toISOString().slice(0, 10)}`,
    reportTitle: "Scheduled Backup",
  });

  const destinationLabel = schedule.destination === "download" ? "Downloaded" : `${schedule.destination} (demo)`;
  if (schedule.destination !== "download") touchSync(schedule.destination);

  logExport({
    format: schedule.format,
    templateLabel: "Scheduled backup",
    destination: destinationLabel,
    count: result.count,
    total: result.total,
  });

  const now = new Date().toISOString();
  commit({ ...schedule, lastRunAt: now, nextRunAt: computeNextRun(schedule.frequency) });
  return true;
}
