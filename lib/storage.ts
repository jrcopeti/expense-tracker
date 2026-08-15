import type { CustomCategory, Expense, Settings } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const EXPENSES_KEY = "hourglass:expenses:v1";
const SETTINGS_KEY = "hourglass:settings:v1";
const CUSTOM_CATEGORIES_KEY = "hourglass:custom-categories:v1";

export function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXPENSES_KEY);
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
    window.localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
    return true;
  } catch {
    return false;
  }
}

export function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
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

export function loadCustomCategories(): CustomCategory[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCustomCategory);
  } catch {
    return [];
  }
}

export function saveCustomCategories(categories: CustomCategory[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
    return true;
  } catch {
    return false;
  }
}

function isValidCustomCategory(value: unknown): value is CustomCategory {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.label === "string" &&
    (v.colorSlot === 0 || v.colorSlot === 1 || v.colorSlot === null) &&
    Array.isArray(v.keywords) &&
    typeof v.createdAt === "string"
  );
}
