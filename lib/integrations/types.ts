export const CONNECTION_IDS = ["google-sheets", "dropbox", "onedrive"] as const;
export type ConnectionId = (typeof CONNECTION_IDS)[number];

export interface ConnectionMeta {
  id: ConnectionId;
  name: string;
  description: string;
  /** Shown on the mock consent screen - this is a simulated OAuth flow, nothing real is requested. */
  permissions: string[];
}

export const CONNECTION_META: Record<ConnectionId, ConnectionMeta> = {
  "google-sheets": {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Keep a live spreadsheet in sync with your expenses.",
    permissions: ["View and manage your spreadsheets", "See your email address"],
  },
  dropbox: {
    id: "dropbox",
    name: "Dropbox",
    description: "Save exports straight into a Dropbox folder.",
    permissions: ["Read and write files in a dedicated app folder", "See your account email"],
  },
  onedrive: {
    id: "onedrive",
    name: "OneDrive",
    description: "Save exports straight into a OneDrive folder.",
    permissions: ["Read and write files in a dedicated app folder", "See your account email"],
  },
};

export interface Connection {
  status: "connected" | "disconnected";
  email: string | null;
  connectedAt: string | null;
  lastSyncAt: string | null;
}

export type ConnectionsState = Record<ConnectionId, Connection>;

export const DEFAULT_CONNECTION: Connection = {
  status: "disconnected",
  email: null,
  connectedAt: null,
  lastSyncAt: null,
};

export function defaultConnectionsState(): ConnectionsState {
  return {
    "google-sheets": { ...DEFAULT_CONNECTION },
    dropbox: { ...DEFAULT_CONNECTION },
    onedrive: { ...DEFAULT_CONNECTION },
  };
}
