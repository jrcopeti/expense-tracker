import { CATEGORIES, type Category, type Expense, type ExpenseFilters } from "./types";
import { monthKey, todayIso } from "./format";

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
  return monthKey(todayIso());
}

export function expensesInMonth(expenses: Expense[], targetMonthKey: string): Expense[] {
  return expenses.filter((e) => monthKey(e.date) === targetMonthKey);
}

export interface CategoryTotal {
  category: Category;
  total: number;
  count: number;
  percent: number;
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

  // Iterate every category that actually showed up (built-in seeds above,
  // plus any custom one an expense used), not just the six built-ins -
  // otherwise a custom category's spending would silently vanish from
  // "Where your time goes" and every other totals-by-category view.
  return Array.from(totals.entries())
    .map(([category, entry]) => ({
      category,
      total: entry.total,
      count: entry.count,
      percent: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
    }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.total - a.total);
}

export interface DayTotal {
  date: string; // yyyy-mm-dd
  total: number;
}

/** Every calendar day in [today - days + 1, today], zero-filled, oldest first. */
export function dailyTotals(expenses: Expense[], days: number): DayTotal[] {
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);

  const now = new Date();
  const out: DayTotal[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    out.push({ date: iso, total: totals.get(iso) ?? 0 });
  }
  return out;
}

/**
 * Consecutive days, ending today, spent at or under `dailyBudget`. A day
 * with no logged expenses counts as a win (a genuine no-spend day is the
 * best possible outcome, not an unknown). Returns 0 if no budget is set or
 * today itself is already over.
 */
export function currentStreak(expenses: Expense[], dailyBudget: number | null): number {
  if (dailyBudget === null || dailyBudget < 0) return 0;
  const totals = new Map<string, number>();
  for (const e of expenses) totals.set(e.date, (totals.get(e.date) ?? 0) + e.amount);

  let streak = 0;
  const now = new Date();
  for (let i = 0; i < 3650; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const total = totals.get(iso) ?? 0;
    if (total <= dailyBudget) streak += 1;
    else break;
  }
  return streak;
}
