"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { FilterBar } from "@/components/expenses/FilterBar";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";
import { QuickCapture } from "@/components/expenses/QuickCapture";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { filterExpenses, sumAmount } from "@/lib/expense-utils";
import { DEFAULT_FILTERS, type Expense, type ExpenseFilters } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";
import { downloadCsv } from "@/lib/csv";

export default function ExpensesPage() {
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { settings, isLoading: settingsLoading } = useSettings();
  const isLoading = expensesLoading || settingsLoading;
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS);
  const [modalState, setModalState] = useState<{ open: boolean; expense?: Expense }>({ open: false });

  const filtered = useMemo(() => filterExpenses(expenses, filters), [expenses, filters]);
  const filteredTotal = useMemo(() => sumAmount(filtered), [filtered]);

  function handleExport() {
    if (filtered.length === 0) {
      toast.error("Nothing to export with the current filters");
      return;
    }
    downloadCsv(filtered, settings);
    toast.success(`Exported ${filtered.length} expense${filtered.length === 1 ? "" : "s"} to CSV`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="mt-1 text-sm text-secondary">
            {isLoading
              ? "Loading..."
              : `${filtered.length} of ${expenses.length} expense${expenses.length === 1 ? "" : "s"} · ${formatCurrency(filteredTotal)} · ≈ ${formatTimeCost(filteredTotal, settings)}`}
          </p>
        </div>
        <Button variant="secondary" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="mt-6">
        <QuickCapture onOpenForm={(expense) => setModalState({ open: true, expense })} />
      </div>

      <div className="mt-6">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <ExpenseList
            expenses={filtered}
            totalCount={expenses.length}
            settings={settings}
            onEdit={(expense) => setModalState({ open: true, expense })}
          />
        )}
      </div>

      {modalState.open && (
        <ExpenseFormModal
          key={modalState.expense?.id ?? "new"}
          expense={modalState.expense}
          onClose={() => setModalState({ open: false })}
        />
      )}
    </div>
  );
}
