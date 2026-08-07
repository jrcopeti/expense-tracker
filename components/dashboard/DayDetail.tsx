"use client";

import { X, Pencil } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";
import type { Expense, Settings } from "@/lib/types";

interface DayDetailProps {
  date: string;
  expenses: Expense[];
  settings: Settings;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
}

export function DayDetail({ date, expenses, settings, onClose, onEdit }: DayDetailProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{formatDate(date)}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {expenses.length === 0
              ? "Nothing logged"
              : `${formatCurrency(total)} · ≈ ${formatTimeCost(total, settings)} of your life`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close day detail"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {expenses.length > 0 && (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {expenses.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <CategoryBadge category={expense.category} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{expense.description}</span>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(expense.amount)}
              </span>
              <button
                type="button"
                onClick={() => onEdit(expense)}
                aria-label="Edit expense"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-accent"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
