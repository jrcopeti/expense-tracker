"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/integrations/historyStore";
import type { ExportHistoryEntry } from "@/lib/integrations/historyStore";
import { useIsClient } from "./useIsClient";

export function useExportHistory() {
  const history = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const logExport = useCallback((entry: Omit<ExportHistoryEntry, "id" | "timestamp">) => store.logExport(entry), []);
  const clearHistory = useCallback(() => store.clearHistory(), []);

  return { history, isLoading: !isClient, logExport, clearHistory };
}
