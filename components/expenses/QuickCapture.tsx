"use client";

import { useState, type FormEvent } from "react";
import { Wand2, ListPlus } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { parseExpenseInput } from "@/lib/parse-expense";
import { formatCurrency } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";
import type { Expense } from "@/lib/types";

interface QuickCaptureProps {
  /** Opens the full add/edit form, pre-filled if an expense is passed. */
  onOpenForm: (expense?: Expense) => void;
}

export function QuickCapture({ onOpenForm }: QuickCaptureProps) {
  const { addExpense } = useExpenses();
  const { settings } = useSettings();
  const { customCategories } = useCategories();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = parseExpenseInput(text, customCategories);
    if (!parsed) {
      setError("Couldn't find an amount - try “12.50 coffee” or “gas 40”.");
      return;
    }

    const expense = addExpense({
      date: parsed.date,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
    });
    setText("");
    setError(null);
    showLoggedToast(expense, settings, () => onOpenForm(expense));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Wand2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-accent" />
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type it like you'd say it: “12.50 coffee”, “gas 40 yesterday”..."
            className="h-12 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            aria-label="Quick-add an expense"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "quick-capture-error" : undefined}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg" className="flex-1 sm:flex-none">
            Log it
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-12 shrink-0 px-0"
            onClick={() => onOpenForm()}
            aria-label="Open the full form"
            title="Open the full form"
          >
            <ListPlus className="h-4.5 w-4.5" />
          </Button>
        </div>
      </div>
      {error && (
        <p id="quick-capture-error" className="text-xs font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function showLoggedToast(expense: Expense, settings: ReturnType<typeof useSettings>["settings"], onEdit: () => void) {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 shadow-lg transition-opacity ${
          t.visible ? "opacity-100" : "opacity-0"
        }`}
      >
        <CategoryBadge category={expense.category} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm text-foreground">
            <span className="font-semibold">{formatCurrency(expense.amount)}</span> · {expense.description}
          </p>
          <p className="text-xs text-muted">≈ {formatTimeCost(expense.amount, settings)} of your life</p>
        </div>
        <button
          type="button"
          onClick={() => {
            toast.dismiss(t.id);
            onEdit();
          }}
          className="ml-1 shrink-0 text-xs font-semibold text-accent hover:underline"
        >
          Edit
        </button>
      </div>
    ),
    { duration: 6000 },
  );
}
