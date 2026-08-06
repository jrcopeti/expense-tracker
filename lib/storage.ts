import type { Expense } from "./types";

const STORAGE_KEY = "expense-tracker:expenses:v1";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidExpense);
  } catch {
    return [];
  }
}

/** Returns false if persistence failed (private mode, quota, etc.) so callers can warn the user. */
export function saveExpenses(expenses: Expense[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    return false;
  }
}

function isValidExpense(value: unknown): value is Expense {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.date === "string" &&
    typeof v.amount === "number" &&
    typeof v.category === "string" &&
    typeof v.description === "string"
  );
}
