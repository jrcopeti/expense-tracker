"use client";

import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useExpenses } from "@/hooks/useExpenses";
import { runDueBackupIfNeeded } from "@/lib/integrations/scheduleStore";

/**
 * Mounted once in the root layout. On load, checks whether a scheduled
 * backup is overdue and - if so - actually runs it (a real download, a
 * real history entry) right now. This is the honest way to "background
 * schedule" in an app with no server: nothing fires while the tab is
 * closed, so it catches up the moment you reopen Hourglass instead.
 */
export function ScheduledBackupRunner() {
  const { expenses, isLoading } = useExpenses();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (isLoading || hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    runDueBackupIfNeeded(expenses).then((ran) => {
      if (ran) toast.success("Your scheduled backup just ran");
    });
  }, [isLoading, expenses]);

  return null;
}
