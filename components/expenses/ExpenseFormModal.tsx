"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Field, fieldClasses } from "@/components/ui/Field";
import { useExpenses } from "@/context/ExpenseContext";
import { CATEGORIES, type Expense } from "@/lib/types";
import { todayIso } from "@/lib/format";
import { validateExpense, toExpenseInput, type ExpenseFormValues, type FormErrors } from "@/lib/validation";

interface ExpenseFormModalProps {
  onClose: () => void;
  /** Present when editing an existing expense; absent when adding a new one. */
  expense?: Expense;
}

const EMPTY_VALUES: ExpenseFormValues = {
  date: "",
  amount: "",
  category: "",
  description: "",
};

function valuesFromExpense(expense?: Expense): ExpenseFormValues {
  if (!expense) return { ...EMPTY_VALUES, date: todayIso() };
  return {
    date: expense.date,
    amount: String(expense.amount),
    category: expense.category,
    description: expense.description,
  };
}

export function ExpenseFormModal({ onClose, expense }: ExpenseFormModalProps) {
  // The parent only mounts this component while the dialog is open, and
  // remounts it (via a `key`) when switching between add/edit targets - so
  // this lazy initializer is all that's needed to start each dialog fresh.
  const { addExpense, updateExpense } = useExpenses();
  const [values, setValues] = useState<ExpenseFormValues>(() => valuesFromExpense(expense));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const isEditing = Boolean(expense);

  useEffect(() => {
    requestAnimationFrame(() => firstFieldRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleChange<K extends keyof ExpenseFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateExpense(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    const input = toExpenseInput(values);
    if (isEditing && expense) {
      updateExpense(expense.id, input);
      toast.success("Expense updated");
    } else {
      addExpense(input);
      toast.success("Expense added");
    }
    setIsSubmitting(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id={titleId} className="text-lg font-semibold">
            {isEditing ? "Edit expense" : "Add expense"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Date" htmlFor="expense-date" error={errors.date}>
              <input
                ref={firstFieldRef}
                id="expense-date"
                type="date"
                max={todayIso()}
                value={values.date}
                onChange={(e) => handleChange("date", e.target.value)}
                className={fieldClasses(Boolean(errors.date))}
                aria-invalid={Boolean(errors.date)}
                aria-describedby={errors.date ? "expense-date-error" : undefined}
              />
            </Field>

            <Field label="Amount" htmlFor="expense-amount" error={errors.amount}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
                  $
                </span>
                <input
                  id="expense-amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={values.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  className={fieldClasses(Boolean(errors.amount)) + " pl-6"}
                  aria-invalid={Boolean(errors.amount)}
                  aria-describedby={errors.amount ? "expense-amount-error" : undefined}
                />
              </div>
            </Field>
          </div>

          <Field label="Category" htmlFor="expense-category" error={errors.category}>
            <select
              id="expense-category"
              value={values.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className={fieldClasses(Boolean(errors.category))}
              aria-invalid={Boolean(errors.category)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Description" htmlFor="expense-description" error={errors.description}>
            <input
              id="expense-description"
              type="text"
              placeholder="e.g. Groceries at Whole Foods"
              value={values.description}
              onChange={(e) => handleChange("description", e.target.value)}
              maxLength={140}
              className={fieldClasses(Boolean(errors.description))}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? "expense-description-error" : undefined}
            />
          </Field>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isEditing ? "Save changes" : "Add expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
