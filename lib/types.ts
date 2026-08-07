export const CATEGORIES = [
  "Food",
  "Transportation",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

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
