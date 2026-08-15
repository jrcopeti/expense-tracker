export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

/** One of the six built-in categories, always present. */
export type BuiltInCategory = (typeof CATEGORIES)[number];

/**
 * A built-in category id or a user-created one (`CustomCategory.id`). Kept
 * as `string` rather than a closed union since custom categories are added
 * at runtime - see `lib/categories.ts`'s `resolveCategoryMeta` for how an
 * id (built-in or custom) resolves to a label/icon/color.
 */
export type Category = string;

/**
 * A category a user created at runtime, persisted alongside expenses.
 * `colorSlot` is assigned once at creation from the two reserved
 * categorical color slots (see `app/globals.css`'s `--cat-custom-*`) and
 * never reassigned - `null` once both are taken, meaning this category
 * renders with the neutral fallback color instead of a unique hue (see
 * `lib/categories.ts` for why a fixed cap, not a generated color).
 */
export interface CustomCategory {
  id: string;
  label: string;
  colorSlot: 0 | 1 | null;
  keywords: string[];
  createdAt: string;
}

export interface Expense {
  id: string;
  date: string; // ISO date, yyyy-mm-dd
  amount: number;
  category: Category;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

export type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  startDate: string;
  endDate: string;
  sort: SortKey;
}

export const DEFAULT_FILTERS: ExpenseFilters = {
  search: "",
  category: "All",
  startDate: "",
  endDate: "",
  sort: "date-desc",
};

/**
 * Everything Hourglass needs to turn a dollar amount into a time cost.
 * `hourlyWage` is the source of truth; the income fields are only kept
 * around so the settings form can be reopened pre-filled with how it was
 * derived last time.
 */
export interface Settings {
  hourlyWage: number | null;
  monthlyIncome: number | null;
  hoursPerWeek: number;
  dailyBudget: number | null;
}

export const DEFAULT_SETTINGS: Settings = {
  hourlyWage: null,
  monthlyIncome: null,
  hoursPerWeek: 40,
  dailyBudget: null,
};
