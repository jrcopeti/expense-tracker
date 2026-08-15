"use client";

import { useMemo, useState } from "react";
import { Wallet, Receipt, TrendingUp, Sparkles, Settings as SettingsIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ExportDrawer } from "@/components/export/ExportDrawer";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { StreakBadge } from "@/components/dashboard/StreakBadge";
import { HeatmapCalendar } from "@/components/dashboard/HeatmapCalendar";
import { CategoryTimeChart } from "@/components/dashboard/CategoryTimeChart";
import { DayDetail } from "@/components/dashboard/DayDetail";
import { QuickCapture } from "@/components/expenses/QuickCapture";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import {
  currentMonthKey,
  currentStreak,
  dailyTotals,
  expensesInMonth,
  sumAmount,
  totalsByCategory,
} from "@/lib/expense-utils";
import { amountToHours, formatHours } from "@/lib/time-cost";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";
import type { Expense } from "@/lib/types";

const HEATMAP_DAYS = 182; // ~26 weeks, GitHub-graph-style

export default function DashboardPage() {
  const { expenses, isLoading: expensesLoading, loadSampleData } = useExpenses();
  const { settings, isLoading: settingsLoading, isConfigured, updateSettings } = useSettings();
  const isLoading = expensesLoading || settingsLoading;

  const [modalState, setModalState] = useState<{ open: boolean; expense?: Expense }>({ open: false });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const totalSpending = useMemo(() => sumAmount(expenses), [expenses]);
  const monthSpending = useMemo(() => sumAmount(expensesInMonth(expenses, currentMonthKey())), [expenses]);
  const monthHours = useMemo(() => amountToHours(monthSpending, settings), [monthSpending, settings]);
  const categoryTotals = useMemo(() => totalsByCategory(expenses), [expenses]);
  const heatmapDays = useMemo(() => dailyTotals(expenses, HEATMAP_DAYS), [expenses]);
  const streak = useMemo(() => currentStreak(expenses, settings.dailyBudget), [expenses, settings.dailyBudget]);
  const topCategory = categoryTotals[0];

  const dayExpenses = useMemo(
    () => (selectedDate ? expenses.filter((e) => e.date === selectedDate) : []),
    [expenses, selectedDate],
  );

  function handleLoadSampleData() {
    loadSampleData();
    if (!isConfigured) updateSettings({ hourlyWage: 32 });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-12 w-full" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[110px]" />
          ))}
        </div>
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">Every dollar, measured in the hours it cost you.</p>
        </div>
        {expenses.length > 0 && (
          <Button variant="secondary" onClick={() => setIsExportOpen(true)}>
            <Download className="h-4 w-4" />
            Export data
          </Button>
        )}
      </div>

      <div className="mt-6">
        <QuickCapture onOpenForm={(expense) => setModalState({ open: true, expense })} />
      </div>

      {!isConfigured && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-medium">Set the value of your time</span> to see spending as hours, not just dollars.
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
            description="Type an expense into the box above to get started, or load six months of sample data to explore the dashboard."
            action={
              <Button variant="secondary" onClick={handleLoadSampleData} className="mt-2">
                <Sparkles className="h-4 w-4" />
                Load sample data
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <Card className="mt-6 p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">This month cost you</p>
                {monthHours !== null ? (
                  <>
                    <p className="mt-1 text-5xl font-semibold tracking-tight text-foreground">{formatHours(monthHours)}</p>
                    <p className="mt-1.5 text-sm text-muted">of your life — {formatCurrency(monthSpending)}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-5xl font-semibold tracking-tight text-foreground">
                      {formatCurrencyCompact(monthSpending)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(true)}
                      className="mt-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      Set your hourly rate to see this in hours →
                    </button>
                  </>
                )}
              </div>
              <StreakBadge streak={streak} dailyBudget={settings.dailyBudget} />
            </div>
          </Card>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total spending" value={formatCurrencyCompact(totalSpending)} icon={Wallet} hint="all time" />
            <StatCard
              label="Transactions"
              value={String(expenses.length)}
              icon={Receipt}
              hint={`avg ${formatCurrency(totalSpending / expenses.length)}`}
            />
            <Card className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-secondary">Top category</p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <TrendingUp className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
              {topCategory ? (
                <>
                  <CategoryBadge category={topCategory.category} />
                  <p className="text-xs text-muted">
                    {formatCurrency(topCategory.total)} · {topCategory.percent.toFixed(0)}% of total
                  </p>
                </>
              ) : (
                <p className="text-2xl font-semibold text-foreground">—</p>
              )}
            </Card>
          </div>

          <div className="mt-6">
            <HeatmapCalendar
              days={heatmapDays}
              settings={settings}
              selectedDate={selectedDate}
              onSelectDay={(date) => setSelectedDate((prev) => (prev === date ? null : date))}
            />
          </div>

          {selectedDate && (
            <div className="mt-6">
              <DayDetail
                date={selectedDate}
                expenses={dayExpenses}
                settings={settings}
                onClose={() => setSelectedDate(null)}
                onEdit={(expense) => setModalState({ open: true, expense })}
              />
            </div>
          )}

          <div className="mt-6">
            <CategoryTimeChart data={categoryTotals} settings={settings} />
          </div>
        </>
      )}

      {modalState.open && (
        <ExpenseFormModal
          key={modalState.expense?.id ?? "new"}
          expense={modalState.expense}
          onClose={() => setModalState({ open: false })}
        />
      )}
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
      {isExportOpen && <ExportDrawer expenses={expenses} onClose={() => setIsExportOpen(false)} />}
    </div>
  );
}
