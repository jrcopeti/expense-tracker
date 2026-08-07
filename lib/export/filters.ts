import type { Expense } from "@/lib/types";
import type { ExportFilters } from "./types";

/** Pure - no side effects, so both the live preview and the actual export use the exact same selection. */
export function selectExpensesForExport(expenses: Expense[], filters: ExportFilters): Expense[] {
  return expenses
    .filter((e) => {
      if (filters.startDate && e.date < filters.startDate) return false;
      if (filters.endDate && e.date > filters.endDate) return false;
      if (filters.categories !== "all" && !filters.categories.includes(e.category)) return false;
      return true;
    })
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));
}

export function sumExpenses(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export const RANGE_PRESETS: Array<{ id: "7d" | "30d" | "90d" | "month" | "all"; label: string }> = [
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "90d", label: "Last 90 days" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];
export type RangePreset = (typeof RANGE_PRESETS)[number]["id"];

export function resolvePreset(preset: RangePreset): { startDate: string; endDate: string } {
  const today = new Date();
  const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  switch (preset) {
    case "7d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case "30d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 29);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case "90d": {
      const start = new Date(today);
      start.setDate(start.getDate() - 89);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case "month": {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: iso(start), endDate: iso(today) };
    }
    case "all":
    default:
      return { startDate: "", endDate: "" };
  }
}
