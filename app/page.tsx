"use client";

import { useMemo, useState } from "react";
import { Wallet, CalendarDays, Receipt, TrendingUp, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/dashboard/StatCard";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { MonthlyTrendChart } from "@/components/dashboard/MonthlyTrendChart";
import { RecentExpenses } from "@/components/dashboard/RecentExpenses";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { useExpenses } from "@/context/ExpenseContext";
import {
  currentMonthKey,
  expensesInMonth,
  monthlyTotals,
  sumAmount,
  totalsByCategory,
} from "@/lib/expense-utils";
import { formatCurrency, formatCurrencyCompact } from "@/lib/format";

export default function DashboardPage() {
  const { expenses, isLoading, loadSampleData } = useExpenses();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const totalSpending = useMemo(() => sumAmount(expenses), [expenses]);

  const monthSpending = useMemo(() => {
    return sumAmount(expensesInMonth(expenses, currentMonthKey()));
  }, [expenses]);

  const previousMonthSpending = useMemo(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, "0")}`;
    return sumAmount(expensesInMonth(expenses, prevKey));
  }, [expenses]);

  const categoryTotals = useMemo(() => totalsByCategory(expenses), [expenses]);
  const trend = useMemo(() => monthlyTotals(expenses, 6), [expenses]);
  const topCategory = categoryTotals[0];

  const monthDelta = useMemo(() => {
    if (previousMonthSpending <= 0) return undefined;
    const change = ((monthSpending - previousMonthSpending) / previousMonthSpending) * 100;
    return {
      value: `${Math.abs(change).toFixed(0)}% vs last month`,
      direction: change >= 0 ? ("up" as const) : ("down" as const),
      isGood: change < 0,
    };
  }, [monthSpending, previousMonthSpending]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[124px]" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <EmptyState
          icon={Wallet}
          title="Welcome to Clarity"
          description="You haven't logged any expenses yet. Add your first one, or load sample data to see the dashboard in action."
          action={
            <div className="mt-2 flex gap-3">
              <Button variant="secondary" onClick={loadSampleData}>
                <Sparkles className="h-4 w-4" />
                Load sample data
              </Button>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add expense
              </Button>
            </div>
          }
        />
        {isAddOpen && <ExpenseFormModal onClose={() => setIsAddOpen(false)} />}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-secondary">Here&apos;s how your spending looks.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total spending"
          value={formatCurrencyCompact(totalSpending)}
          icon={Wallet}
          hint="all time"
        />
        <StatCard
          label="This month"
          value={formatCurrencyCompact(monthSpending)}
          icon={CalendarDays}
          delta={monthDelta}
        />
        <StatCard
          label="Transactions"
          value={String(expenses.length)}
          icon={Receipt}
          hint={expenses.length > 0 ? `avg ${formatCurrency(totalSpending / expenses.length)}` : undefined}
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

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CategoryBreakdownChart data={categoryTotals} />
        <MonthlyTrendChart data={trend} />
      </div>

      <div className="mt-6">
        <RecentExpenses expenses={expenses} />
      </div>

      {isAddOpen && <ExpenseFormModal onClose={() => setIsAddOpen(false)} />}
    </div>
  );
}
