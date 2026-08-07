"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { useExportHistory } from "@/hooks/useExportHistory";
import { runExport } from "@/lib/export/runExport";
import { selectExpensesForExport, sumExpenses } from "@/lib/export/filters";
import { FORMAT_META } from "@/lib/export/types";
import type { ExportTemplate } from "@/lib/export-templates";
import type { Expense } from "@/lib/types";

export function TemplateCard({ template, expenses }: { template: ExportTemplate; expenses: Expense[] }) {
  const { logExport } = useExportHistory();
  const [isRunning, setIsRunning] = useState(false);
  const Icon = template.icon;

  const matchCount = selectExpensesForExport(expenses, template.buildFilters()).length;

  async function handleRun() {
    setIsRunning(true);
    try {
      const filters = template.buildFilters();
      const result = await runExport(expenses, {
        format: template.format,
        filters,
        filename: `hourglass-${template.id}-${new Date().toISOString().slice(0, 10)}`,
        reportTitle: template.reportTitle,
      });
      logExport({
        format: template.format,
        templateLabel: template.label,
        destination: "Downloaded",
        count: result.count,
        total: sumExpenses(selectExpensesForExport(expenses, filters)),
      });
      toast.success(`${template.label} exported (${result.count} expense${result.count === 1 ? "" : "s"})`);
    } catch {
      toast.error("Couldn't generate that report - please try again.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-start justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <span className="rounded-full bg-surface-hover px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted">
          {FORMAT_META[template.format].label}
        </span>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{template.label}</h3>
        <p className="mt-1 text-xs leading-relaxed text-secondary">{template.description}</p>
      </div>
      <button
        type="button"
        onClick={handleRun}
        disabled={isRunning || matchCount === 0}
        className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline disabled:pointer-events-none disabled:text-muted disabled:no-underline"
      >
        {isRunning ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Generating...
          </>
        ) : matchCount === 0 ? (
          "No data yet"
        ) : (
          <>
            Generate ({matchCount})
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </Card>
  );
}
