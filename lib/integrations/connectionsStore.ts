import { CONNECTION_IDS, defaultConnectionsState, type ConnectionId, type ConnectionsState } from "./types";

const STORAGE_KEY = "hourglass:connections:v1";

type Listener = () => void;
const listeners = new Set<Listener>();
let cache: ConnectionsState | null = null;

function readFromStorage(): ConnectionsState {
  if (typeof window === "undefined") return defaultConnectionsState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConnectionsState();
    const parsed = JSON.parse(raw);
    const base = defaultConnectionsState();
    for (const id of CONNECTION_IDS) {
      if (parsed[id]) base[id] = { ...base[id], ...parsed[id] };
    }
    return base;
  } catch {
    return defaultConnectionsState();
  }
}

function persist(state: ConnectionsState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort - the in-memory state still works for this session.
  }
}

function readCache(): ConnectionsState {
  if (cache === null) cache = readFromStorage();
  return cache;
}

function commit(next: ConnectionsState) {
  cache = next;
  persist(next);
  listeners.forEach((l) => l());
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): ConnectionsState {
  return readCache();
}

export function getServerSnapshot(): ConnectionsState {
  return defaultConnectionsState();
}

export function connect(id: ConnectionId, email: string) {
  const now = new Date().toISOString();
  commit({
    ...readCache(),
    [id]: { status: "connected", email, connectedAt: now, lastSyncAt: now },
  });
}

export function disconnect(id: ConnectionId) {
  commit({
    ...readCache(),
    [id]: { status: "disconnected", email: null, connectedAt: null, lastSyncAt: null },
  });
}

export function touchSync(id: ConnectionId) {
  const current = readCache()[id];
  if (current.status !== "connected") return;
  commit({ ...readCache(), [id]: { ...current, lastSyncAt: new Date().toISOString() } });
}
