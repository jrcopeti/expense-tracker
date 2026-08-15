"use client";

import { useEffect, useId, useMemo, type ReactNode } from "react";
import { X, Download, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Portal } from "@/components/ui/Portal";
import { Button } from "@/components/ui/Button";
import { FormatPicker } from "@/components/export/FormatPicker";
import { DateRangeFilter } from "@/components/export/DateRangeFilter";
import { CategoryFilter } from "@/components/export/CategoryFilter";
import { PreviewTable } from "@/components/export/PreviewTable";
import { useExportForm } from "@/hooks/useExportForm";
import { selectExpensesForExport, sumExpenses } from "@/lib/export/filters";
import { runExport } from "@/lib/export/runExport";
import { FORMAT_META } from "@/lib/export/types";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/lib/types";

interface ExportDrawerProps {
  expenses: Expense[];
  onClose: () => void;
}

export function ExportDrawer({ expenses, onClose }: ExportDrawerProps) {
  const { state, dispatch } = useExportForm();
  const titleId = useId();
  const isExporting = state.status === "exporting";

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isExporting) onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, isExporting]);

  const filtered = useMemo(() => selectExpensesForExport(expenses, state.filters), [expenses, state.filters]);
  const total = useMemo(() => sumExpenses(filtered), [filtered]);
  const canExport = filtered.length > 0 && !isExporting;

  async function handleExport() {
    dispatch({ type: "EXPORT_START" });
    try {
      const result = await runExport(expenses, {
        format: state.format,
        filters: state.filters,
        filename: state.filename,
      });
      dispatch({ type: "EXPORT_SUCCESS" });
      toast.success(`Exported ${result.count} expense${result.count === 1 ? "" : "s"} as ${result.filename}`);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed - please try again.";
      dispatch({ type: "EXPORT_ERROR", message });
      toast.error(message);
    }
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex justify-end">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={isExporting ? undefined : onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-2xl animate-[slideInRight_220ms_ease-out]"
        >
          <div className="flex items-start justify-between border-b border-border px-6 py-5">
            <div>
              <h2 id={titleId} className="text-lg font-semibold text-foreground">
                Export data
              </h2>
              <p className="mt-1 text-sm text-secondary">
                Choose a format, filter what you need, and preview it before you download.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              aria-label="Close"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <Section label="Format">
              <FormatPicker value={state.format} onChange={(format) => dispatch({ type: "SET_FORMAT", format })} />
            </Section>

            <Section label="Date range">
              <DateRangeFilter
                startDate={state.filters.startDate}
                endDate={state.filters.endDate}
                onPreset={(preset) => dispatch({ type: "APPLY_PRESET", preset })}
                onStartDate={(date) => dispatch({ type: "SET_START_DATE", date })}
                onEndDate={(date) => dispatch({ type: "SET_END_DATE", date })}
              />
            </Section>

            <Section label="Categories">
              <CategoryFilter
                selected={state.filters.categories}
                onToggle={(category) => dispatch({ type: "TOGGLE_CATEGORY", category })}
                onSelectAll={() => dispatch({ type: "SET_ALL_CATEGORIES" })}
              />
            </Section>

            <Section label="Filename">
              <div className="flex items-center rounded-lg border border-border bg-surface focus-within:ring-2 focus-within:ring-accent/40">
                <input
                  type="text"
                  value={state.filename}
                  onChange={(e) => dispatch({ type: "SET_FILENAME", filename: e.target.value })}
                  className="w-full rounded-l-lg bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none"
                  placeholder="export"
                  aria-label="Export filename"
                />
                <span className="shrink-0 rounded-r-lg bg-surface-hover px-3 py-2 text-xs font-medium text-muted">
                  .{FORMAT_META[state.format].extension}
                </span>
              </div>
            </Section>

            <Section label={`Preview${filtered.length ? ` (${filtered.length})` : ""}`}>
              <PreviewTable expenses={filtered} />
            </Section>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {filtered.length} expense{filtered.length === 1 ? "" : "s"} selected
              </p>
              <p className="text-xs text-muted">{formatCurrency(total)} total</p>
            </div>
            <Button onClick={handleExport} disabled={!canExport}>
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export {FORMAT_META[state.format].label}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted">{label}</h3>
      {children}
    </div>
  );
}
