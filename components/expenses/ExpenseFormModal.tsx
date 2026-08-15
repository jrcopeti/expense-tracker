"use client";

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { Field, fieldClasses } from "@/components/ui/Field";
import { Portal } from "@/components/ui/Portal";
import { useExpenses } from "@/hooks/useExpenses";
import { useSettings } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import type { Expense } from "@/lib/types";
import { todayIso } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";
import { validateExpense, toExpenseInput, type ExpenseFormValues, type FormErrors } from "@/lib/validation";
import { CATEGORY_ICONS, CATEGORY_ICON_IDS, DEFAULT_CATEGORY_ICON_ID, type CategoryIconId } from "@/lib/category-icons";

/** Sentinel select value that opens the inline "new category" field instead of setting a category. */
const NEW_CATEGORY_VALUE = "__new__";

interface ExpenseFormModalProps {
  onClose: () => void;
  /** Present when editing an existing expense; absent when adding a new one. */
  expense?: Expense;
}

const EMPTY_VALUES: ExpenseFormValues = { date: "", amount: "", category: "", description: "" };

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
  const { settings } = useSettings();
  const { options: categoryOptions, validIds: validCategoryIds, addCategory } = useCategories();
  const [values, setValues] = useState<ExpenseFormValues>(() => valuesFromExpense(expense));
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newCategoryIconId, setNewCategoryIconId] = useState<CategoryIconId>(DEFAULT_CATEGORY_ICON_ID);
  const [newCategoryError, setNewCategoryError] = useState<string | null>(null);
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

  const timeCost = useMemo(() => {
    const amount = Number(values.amount);
    if (!(amount > 0)) return null;
    return formatTimeCost(amount, settings);
  }, [values.amount, settings]);

  function handleChange<K extends keyof ExpenseFormValues>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleCategorySelect(value: string) {
    if (value === NEW_CATEGORY_VALUE) {
      setIsAddingCategory(true);
      return;
    }
    handleChange("category", value);
  }

  function handleAddCategory() {
    const result = addCategory(newCategoryLabel, newCategoryIconId);
    if (!result.ok) {
      setNewCategoryError(result.error);
      return;
    }
    handleChange("category", result.category.id);
    setIsAddingCategory(false);
    setNewCategoryLabel("");
    setNewCategoryIconId(DEFAULT_CATEGORY_ICON_ID);
    setNewCategoryError(null);
  }

  function handleCancelAddCategory() {
    setIsAddingCategory(false);
    setNewCategoryLabel("");
    setNewCategoryIconId(DEFAULT_CATEGORY_ICON_ID);
    setNewCategoryError(null);
  }

  function handleNewCategoryKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    // This input lives inside the expense <form> - stop Enter from
    // submitting that outer form and treat it as "confirm this category" instead.
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCategory();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validateExpense(values, validCategoryIds);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const input = toExpenseInput(values);
    if (isEditing && expense) {
      updateExpense(expense.id, input);
      toast.success("Expense updated");
    } else {
      addExpense(input);
      toast.success("Expense added");
    }
    onClose();
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
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
              />
            </Field>

            <Field label="Amount" htmlFor="expense-amount" error={errors.amount} hint={timeCost ? `≈ ${timeCost} of your life` : undefined}>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
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
                />
              </div>
            </Field>
          </div>

          <Field label="Category" htmlFor="expense-category" error={errors.category}>
            <select
              id="expense-category"
              value={values.category}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className={fieldClasses(Boolean(errors.category))}
              aria-invalid={Boolean(errors.category)}
            >
              <option value="" disabled>
                Select a category
              </option>
              {categoryOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.meta.label}
                </option>
              ))}
              <option value={NEW_CATEGORY_VALUE}>+ Add new category…</option>
            </select>
          </Field>

          {isAddingCategory && (
            <div className="-mt-2 flex flex-col gap-1.5 rounded-xl border border-border bg-surface-hover p-3">
              <label htmlFor="new-category-label" className="text-xs font-medium text-secondary">
                New category name
              </label>
              <div className="flex gap-2">
                <input
                  id="new-category-label"
                  type="text"
                  autoFocus
                  placeholder="e.g. Subscriptions"
                  value={newCategoryLabel}
                  onChange={(e) => {
                    setNewCategoryLabel(e.target.value);
                    if (newCategoryError) setNewCategoryError(null);
                  }}
                  onKeyDown={handleNewCategoryKeyDown}
                  className={fieldClasses(Boolean(newCategoryError))}
                  aria-invalid={Boolean(newCategoryError)}
                />
                <Button type="button" size="sm" onClick={handleAddCategory}>
                  Add
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleCancelAddCategory}>
                  Cancel
                </Button>
              </div>

              <span className="mt-1 text-xs font-medium text-secondary">Icon</span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category icon">
                {CATEGORY_ICON_IDS.map((iconId) => {
                  const Icon = CATEGORY_ICONS[iconId];
                  const selected = iconId === newCategoryIconId;
                  return (
                    <button
                      key={iconId}
                      type="button"
                      onClick={() => setNewCategoryIconId(iconId)}
                      aria-pressed={selected}
                      aria-label={iconId}
                      title={iconId}
                      className={clsx(
                        "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                        selected
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border text-secondary hover:bg-surface-hover hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </button>
                  );
                })}
              </div>

              {newCategoryError && (
                <p className="text-xs font-medium text-danger" role="alert">
                  {newCategoryError}
                </p>
              )}
            </div>
          )}

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
            />
          </Field>

          <div className="mt-2 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{isEditing ? "Save changes" : "Add expense"}</Button>
          </div>
        </form>
      </div>
    </div>
    </Portal>
  );
}
