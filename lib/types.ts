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
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

export type SortKey = "date-desc" | "date-asc" | "amount-desc" | "amount-asc";

export interface ExpenseFilters {
  search: string;
  category: Category | "All";
  startDate: string; // "" = no lower bound
  endDate: string; // "" = no upper bound
  sort: SortKey;
}

export const DEFAULT_FILTERS: ExpenseFilters = {
  search: "",
  category: "All",
  startDate: "",
  endDate: "",
  sort: "date-desc",
};
