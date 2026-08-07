"use client";

import { useCallback, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import type { Settings } from "@/lib/types";
import * as store from "@/lib/settingsStore";
import { effectiveHourlyWage } from "@/lib/time-cost";
import { useIsClient } from "./useIsClient";

const PERSIST_WARNING = "This browser couldn't save your settings. They'll reset on reload.";

export function useSettings() {
  const settings = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    if (!store.updateSettings(patch)) toast.error(PERSIST_WARNING);
  }, []);

  const isConfigured = isClient && effectiveHourlyWage(settings) !== null;

  return { settings, isLoading: !isClient, isConfigured, updateSettings };
}
