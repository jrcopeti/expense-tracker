"use client";

import { History, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useExportHistory } from "@/hooks/useExportHistory";
import { FORMAT_META } from "@/lib/export/types";
import { formatCurrency, formatRelativeTime } from "@/lib/format";

export function HistoryTable() {
  const { history, clearHistory } = useExportHistory();

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <History className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">Export history</h3>
        </div>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="flex items-center gap-1.5 text-xs font-medium text-secondary hover:text-danger"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={History} title="No exports yet" description="Generate a template or run a backup to see it logged here." />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {history.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{entry.templateLabel}</p>
                <p className="truncate text-xs text-muted">
                  {entry.destination} · {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-semibold tabular-nums text-foreground">{formatCurrency(entry.total)}</p>
                <p className="text-[11px] text-muted">
                  {entry.count} · {FORMAT_META[entry.format].label}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
