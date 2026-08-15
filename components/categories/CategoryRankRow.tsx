"use client";

import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { useCategories } from "@/hooks/useCategories";
import type { CategoryTotal } from "@/lib/expense-utils";
import { formatCurrency } from "@/lib/format";
import { amountToHours, formatHours } from "@/lib/time-cost";
import type { Settings } from "@/lib/types";

interface CategoryRankRowProps {
  rank: number;
  row: CategoryTotal;
  /** Largest total in the ranking - bars are drawn relative to it so the top category fills the track. */
  maxTotal: number;
  settings: Settings;
}

/** Every sub-1% share would otherwise round to "0%", which reads as "nothing spent here". */
function formatShare(percent: number): string {
  if (percent > 0 && percent < 1) return "<1%";
  return `${percent.toFixed(0)}%`;
}

export function CategoryRankRow({ rank, row, maxTotal, settings }: CategoryRankRowProps) {
  const { metaOf } = useCategories();
  const hours = amountToHours(row.total, settings);
  const barPercent = maxTotal > 0 ? Math.max(2, (row.total / maxTotal) * 100) : 0;

  return (
    <li className="flex flex-col gap-2.5 px-4 py-4 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-4 shrink-0 text-sm font-semibold tabular-nums text-muted">{rank}</span>
          <CategoryBadge category={row.category} className="min-w-0" />
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold tabular-nums text-foreground">
            {hours === null ? formatCurrency(row.total) : formatHours(hours)}
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-muted">
            {hours === null ? "" : `${formatCurrency(row.total)} · `}
            {row.count} {row.count === 1 ? "expense" : "expenses"} · {formatShare(row.percent)}
          </p>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className="h-full rounded-full"
          style={{ width: `${barPercent}%`, backgroundColor: metaOf(row.category).cssVar }}
        />
      </div>
    </li>
  );
}
