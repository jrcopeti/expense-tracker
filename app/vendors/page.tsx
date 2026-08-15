"use client";

import { useMemo } from "react";
import { Store } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { sumAmount } from "@/lib/expense-utils";
import { topVendors } from "@/lib/vendor-utils";
import { formatCurrency, formatDate, formatDateShort } from "@/lib/format";
import { amountToHours, formatHours, formatTimeCost } from "@/lib/time-cost";

const VENDOR_LIMIT = 25;

export default function VendorsPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { settings, isLoading: settingsLoading } = useSettings();
  const isLoading = expensesLoading || settingsLoading;

  const vendors = useMemo(() => topVendors(expenses), [expenses]);
  const totalSpending = useMemo(() => sumAmount(expenses), [expenses]);

  const shown = vendors.slice(0, VENDOR_LIMIT);
  const isConfigured = amountToHours(1, settings) !== null;
  // Bars are proportional to the biggest vendor, not to the grand total, so a
  // long tail of small vendors still renders as something visible.
  const maxTotal = Math.max(1, ...shown.map((v) => v.total));

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-12 w-full" />
        <div className="mt-6 flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[76px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Top vendors</h1>
        <p className="mt-1 text-sm text-secondary">
          {expenses.length === 0
            ? "Who your money — and your hours — actually go to."
            : `${vendors.length} vendor${vendors.length === 1 ? "" : "s"} · ${formatCurrency(totalSpending)}${isConfigured ? ` · ≈ ${formatTimeCost(totalSpending, settings)}` : ""}`}
        </p>
        {expenses.length > 0 && !isConfigured && (
          <p className="mt-1 text-sm text-muted">Set your hourly rate in Settings to see these totals in hours.</p>
        )}
      </div>

      <div className="mt-6">
        {expenses.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No vendors yet"
            description="Vendors are read from each expense's description — log an expense and the ones you spend most on show up here."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((vendor, index) => {
              const hours = amountToHours(vendor.total, settings);
              return (
                <li key={vendor.vendor}>
                  <Card className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-baseline gap-2.5">
                        <span className="text-xs font-semibold tabular-nums text-muted">{index + 1}</span>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{vendor.vendor}</p>
                          <p className="mt-0.5 text-xs text-secondary tabular-nums">
                            {vendor.count} expense{vendor.count === 1 ? "" : "s"} · {vendor.percent.toFixed(1)}% of spend
                            · last {formatDateShort(vendor.lastDate)}
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-semibold tabular-nums text-foreground">
                          {hours !== null ? formatHours(hours) : formatCurrency(vendor.total)}
                        </p>
                        <p className="mt-0.5 text-xs text-secondary tabular-nums">
                          {hours !== null ? formatCurrency(vendor.total) : "of spending"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="mt-3 h-2 rounded-full bg-surface-hover"
                      title={`${vendor.vendor}: ${formatCurrency(vendor.total)}${hours !== null ? ` (${formatHours(hours)})` : ""} · most recent ${formatDate(vendor.lastDate)}`}
                    >
                      <div
                        className="h-2 rounded-full bg-accent"
                        style={{ width: `${Math.max(2, (vendor.total / maxTotal) * 100)}%` }}
                      />
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {vendors.length > shown.length && (
        <p className="mt-4 text-xs text-muted">
          Showing the top {shown.length} of {vendors.length} vendors.
        </p>
      )}
    </div>
  );
}
