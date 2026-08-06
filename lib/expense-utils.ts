import { CATEGORIES, type Category, type Expense, type ExpenseFilters } from "./types";
import { monthKey } from "./format";

export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const search = filters.search.trim().toLowerCase();
  let result = expenses.filter((e) => {
    if (filters.category !== "All" && e.category !== filters.category) return false;
    if (filters.startDate && e.date < filters.startDate) return false;
    if (filters.endDate && e.date > filters.endDate) return false;
    if (search && !e.description.toLowerCase().includes(search)) return false;
    return true;
  });

  result = result.slice().sort((a, b) => {
    switch (filters.sort) {
      case "date-asc":
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      case "amount-desc":
        return b.amount - a.amount;
      case "amount-asc":
        return a.amount - b.amount;
      case "date-desc":
      default:
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
    }
  });

  return result;
}

export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((total, e) => total + e.amount, 0);
}

export function currentMonthKey(): string {
  return monthKey(new Date().toISOString().slice(0, 10));
}

export function expensesInMonth(expenses: Expense[], targetMonthKey: string): Expense[] {
  return expenses.filter((e) => monthKey(e.date) === targetMonthKey);
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percent: number; // 0-100, share of the overall total
}

export function totalsByCategory(expenses: Expense[]): CategoryTotal[] {
  const grandTotal = sumAmount(expenses);
  const totals = new Map<Category, { total: number; count: number }>();
  for (const category of CATEGORIES) totals.set(category, { total: 0, count: 0 });

  for (const e of expenses) {
    const entry = totals.get(e.category) ?? { total: 0, count: 0 };
    entry.total += e.amount;
    entry.count += 1;
    totals.set(e.category, entry);
  }

  return CATEGORIES.map((category) => {
    const entry = totals.get(category)!;
    return {
      category,
      total: entry.total,
      count: entry.count,
      percent: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
    };
  })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);
}

export interface MonthlyTotal {
  monthKey: string; // "yyyy-mm"
  total: number;
}

/** Last `months` calendar months (including the current one), oldest first, zero-filled. */
export function monthlyTotals(expenses: Expense[], months = 6): MonthlyTotal[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const totals = new Map<string, number>(keys.map((k) => [k, 0]));
  for (const e of expenses) {
    const k = monthKey(e.date);
    if (totals.has(k)) totals.set(k, (totals.get(k) ?? 0) + e.amount);
  }

  return keys.map((k) => ({ monthKey: k, total: totals.get(k) ?? 0 }));
}
