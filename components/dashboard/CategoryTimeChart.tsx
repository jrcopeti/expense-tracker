"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCategories } from "@/hooks/useCategories";
import { formatCurrency } from "@/lib/format";
import { amountToHours, formatHours } from "@/lib/time-cost";
import type { CategoryTotal } from "@/lib/expense-utils";
import type { Settings } from "@/lib/types";

interface CategoryTimeChartProps {
  data: CategoryTotal[];
  settings: Settings;
}

export function CategoryTimeChart({ data, settings }: CategoryTimeChartProps) {
  const { metaOf } = useCategories();
  const configured = amountToHours(1, settings) !== null;
  const rows = data.map((d) => ({ ...d, hours: amountToHours(d.total, settings) }));
  const maxValue = Math.max(1, ...rows.map((r) => (configured ? r.hours ?? 0 : r.total)));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground">Where your time goes</h3>
      <p className="mt-0.5 text-xs text-muted">
        {configured ? "Hours of work, by category" : "Set your hourly rate in Settings to see this in hours"}
      </p>

      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Clock} title="No data yet" description="Category totals show up here once you log expenses." />
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {rows.map((row) => {
            const value = configured ? row.hours ?? 0 : row.total;
            const widthPercent = Math.max(4, (value / maxValue) * 100);
            const meta = metaOf(row.category);
            return (
              <li key={row.category} className="flex items-center gap-3">
                <span className="w-[92px] shrink-0 truncate text-xs font-medium text-secondary">{meta.label}</span>
                <div
                  className="relative h-5 flex-1 min-w-0"
                  title={`${meta.label}: ${formatCurrency(row.total)}${row.hours !== null ? ` (${formatHours(row.hours)})` : ""}`}
                >
                  <div className="h-5 rounded-r" style={{ width: `${widthPercent}%`, backgroundColor: meta.cssVar }} />
                </div>
                <span className="w-24 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                  {configured ? formatHours(row.hours ?? 0) : formatCurrency(row.total)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
