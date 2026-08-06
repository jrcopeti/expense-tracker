"use client";

import { useState } from "react";
import { Pencil, Trash2, Receipt } from "lucide-react";
import toast from "react-hot-toast";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useExpenses } from "@/context/ExpenseContext";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

interface ExpenseListProps {
  expenses: Expense[];
  totalCount: number;
  onEdit: (expense: Expense) => void;
}

export function ExpenseList({ expenses, totalCount, onEdit }: ExpenseListProps) {
  const { deleteExpense } = useExpenses();
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  function confirmDelete() {
    if (!pendingDelete) return;
    deleteExpense(pendingDelete.id);
    toast.success("Expense deleted");
    setPendingDelete(null);
  }

  if (totalCount === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses yet"
        description="Add your first expense to start tracking your spending."
      />
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No expenses match your filters"
        description="Try widening your date range or clearing a filter."
      />
    );
  }

  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium text-secondary">
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Description</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="group border-b border-border last:border-0 hover:bg-surface-hover"
              >
                <td className="whitespace-nowrap px-5 py-3.5 text-secondary tabular-nums">
                  {formatDate(expense.date)}
                </td>
                <td className="px-5 py-3.5">
                  <CategoryBadge category={expense.category} size="sm" />
                </td>
                <td className="max-w-xs truncate px-5 py-3.5 text-foreground">{expense.description}</td>
                <td className="whitespace-nowrap px-5 py-3.5 text-right font-medium tabular-nums text-foreground">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <RowAction icon={Pencil} label="Edit expense" onClick={() => onEdit(expense)} />
                    <RowAction
                      icon={Trash2}
                      label="Delete expense"
                      onClick={() => setPendingDelete(expense)}
                      danger
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {expenses.map((expense) => (
          <li key={expense.id} className="rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <CategoryBadge category={expense.category} />
              <span className="font-semibold tabular-nums text-foreground">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <p className="mt-2.5 text-sm text-foreground">{expense.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-secondary tabular-nums">{formatDate(expense.date)}</span>
              <div className="flex gap-1">
                <RowAction icon={Pencil} label="Edit expense" onClick={() => onEdit(expense)} />
                <RowAction
                  icon={Trash2}
                  label="Delete expense"
                  onClick={() => setPendingDelete(expense)}
                  danger
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this expense?"
        description={
          pendingDelete
            ? `"${pendingDelete.description}" for ${formatCurrency(pendingDelete.amount)} will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}

function RowAction({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: typeof Pencil;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        "flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors hover:bg-surface-hover " +
        (danger ? "hover:text-danger" : "hover:text-accent")
      }
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
