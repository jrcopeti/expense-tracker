"use client";

import { useCallback, useSyncExternalStore } from "react";
import * as store from "@/lib/integrations/scheduleStore";
import type { BackupSchedule } from "@/lib/integrations/scheduleStore";
import { useIsClient } from "./useIsClient";

export function useSchedule() {
  const schedule = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const updateSchedule = useCallback(
    (patch: Partial<Omit<BackupSchedule, "nextRunAt" | "lastRunAt">>) => store.updateSchedule(patch),
    [],
  );

  return { schedule, isLoading: !isClient, updateSchedule };
}
