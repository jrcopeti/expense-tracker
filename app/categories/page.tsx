"use client";

import { useMemo, useState } from "react";
import { CalendarOff, Settings as SettingsIcon, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryRankRow } from "@/components/categories/CategoryRankRow";
import { CategoryRangeToggle, type CategoryRange } from "@/components/categories/CategoryRangeToggle";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { currentMonthKey, expensesInMonth, sumAmount, totalsByCategory } from "@/lib/expense-utils";
import { formatCurrency } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";

const SKELETON_ROWS = 5;

export default function CategoriesPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { settings, isLoading: settingsLoading, isConfigured } = useSettings();
  const isLoading = expensesLoading || settingsLoading;

  const [range, setRange] = useState<CategoryRange>("all");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const scoped = useMemo(
    () => (range === "month" ? expensesInMonth(expenses, currentMonthKey()) : expenses),
    [expenses, range],
  );
  const rows = useMemo(() => totalsByCategory(scoped), [scoped]);
  const scopedTotal = useMemo(() => sumAmount(scoped), [scoped]);
  const maxTotal = rows[0]?.total ?? 0; // totalsByCategory is sorted descending

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-6 h-14 w-full" />
        <div className="mt-3 flex flex-col gap-3">
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="mt-1 text-sm text-secondary">Where your hours go, biggest spender first.</p>
        </div>
        {expenses.length > 0 && <CategoryRangeToggle value={range} onChange={setRange} />}
      </div>

      {expenses.length > 0 && !isConfigured && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-medium">Set the value of your time</span> to see what each category costs you in hours.
          </p>
          <Button size="sm" variant="secondary" onClick={() => setIsSettingsOpen(true)}>
            <SettingsIcon className="h-3.5 w-3.5" />
            Set it up
          </Button>
        </div>
      )}

      {expenses.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Wallet}
            title="Nothing logged yet"
            description="Log a few expenses and this page will rank your categories by what they really cost — in hours, not just dollars."
          />
        </div>
      ) : (
        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-border px-4 py-4 sm:px-5">
            <p className="text-sm font-medium text-foreground">
              {rows.length} categor{rows.length === 1 ? "y" : "ies"} · {formatCurrency(scopedTotal)}
            </p>
            <p className="text-sm text-muted">
              {isConfigured
                ? `${formatTimeCost(scopedTotal, settings)} of your life`
                : "Hourly rate not set — showing dollars only"}
            </p>
          </div>

          {rows.length === 0 ? (
            // Only reachable in the "this month" range: an all-time ranking is
            // empty exactly when there are no expenses at all, handled above.
            <div className="p-4 sm:p-5">
              <EmptyState
                icon={CalendarOff}
                title="Nothing spent this month"
                description="No expenses logged this month yet. Switch to all time to see your full ranking."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((row, index) => (
                <CategoryRankRow
                  key={row.category}
                  rank={index + 1}
                  row={row}
                  maxTotal={maxTotal}
                  settings={settings}
                />
              ))}
            </ul>
          )}
        </Card>
      )}

      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}
