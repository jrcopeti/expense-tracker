import { describe, expect, it } from "vitest";
import { currentStreak, dailyTotals, filterExpenses, sumAmount, totalsByCategory } from "./expense-utils";
import { DEFAULT_FILTERS, type Expense } from "./types";

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: overrides.id ?? Math.random().toString(36),
    date: "2026-08-01",
    amount: 10,
    category: "Food",
    description: "test expense",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("filterExpenses", () => {
  const expenses: Expense[] = [
    makeExpense({ id: "1", category: "Food", date: "2026-08-01", description: "Coffee", amount: 5 }),
    makeExpense({ id: "2", category: "Transportation", date: "2026-08-02", description: "Gas", amount: 40 }),
    makeExpense({ id: "3", category: "Food", date: "2026-08-05", description: "Groceries", amount: 60 }),
  ];

  it("returns everything unfiltered by default", () => {
    expect(filterExpenses(expenses, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("filters by category", () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, category: "Food" });
    expect(result.map((e) => e.id)).toEqual(["3", "1"]); // date-desc default sort
  });

  it("filters by date range", () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, startDate: "2026-08-02", endDate: "2026-08-05" });
    expect(result.map((e) => e.id).sort()).toEqual(["2", "3"]);
  });

  it("filters by case-insensitive description search", () => {
    const result = filterExpenses(expenses, { ...DEFAULT_FILTERS, search: "COFFEE" });
    expect(result.map((e) => e.id)).toEqual(["1"]);
  });

  it("sorts by amount ascending and descending", () => {
    const asc = filterExpenses(expenses, { ...DEFAULT_FILTERS, sort: "amount-asc" });
    expect(asc.map((e) => e.id)).toEqual(["1", "2", "3"]);

    const desc = filterExpenses(expenses, { ...DEFAULT_FILTERS, sort: "amount-desc" });
    expect(desc.map((e) => e.id)).toEqual(["3", "2", "1"]);
  });

  it("does not mutate the input array", () => {
    const copy = [...expenses];
    filterExpenses(expenses, { ...DEFAULT_FILTERS, sort: "amount-asc" });
    expect(expenses).toEqual(copy);
  });
});

describe("sumAmount", () => {
  it("sums amounts, 0 for an empty list", () => {
    expect(sumAmount([])).toBe(0);
    expect(sumAmount([makeExpense({ amount: 10 }), makeExpense({ amount: 5.5 })])).toBe(15.5);
  });
});

describe("totalsByCategory", () => {
  it("includes every built-in category with zero spend, sorted descending", () => {
    const totals = totalsByCategory([
      makeExpense({ category: "Food", amount: 30 }),
      makeExpense({ category: "Food", amount: 20 }),
      makeExpense({ category: "Transportation", amount: 10 }),
    ]);
    expect(totals[0]).toMatchObject({ category: "Food", total: 50, count: 2 });
    expect(totals[1]).toMatchObject({ category: "Transportation", total: 10, count: 1 });
    // Zero-spend built-ins are filtered out, not just zeroed.
    expect(totals.some((t) => t.category === "Bills")).toBe(false);
  });

  it("computes percent shares against the grand total", () => {
    const totals = totalsByCategory([makeExpense({ category: "Food", amount: 75 }), makeExpense({ category: "Bills", amount: 25 })]);
    const food = totals.find((t) => t.category === "Food");
    expect(food?.percent).toBeCloseTo(75, 5);
  });

  // Regression test: totalsByCategory used to .map() only over the fixed
  // CATEGORIES list, silently dropping a custom category's spend from every
  // totals-by-category view (see lib/expense-utils.ts's comment).
  it("surfaces a category id outside the built-in set (e.g. a custom category)", () => {
    const totals = totalsByCategory([makeExpense({ category: "custom-subscriptions", amount: 42 })]);
    expect(totals).toEqual([{ category: "custom-subscriptions", total: 42, count: 1, percent: 100 }]);
  });

  it("returns an empty array for no expenses", () => {
    expect(totalsByCategory([])).toEqual([]);
  });
});

describe("dailyTotals", () => {
  it("zero-fills every day in the window, oldest first, ending today", () => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const result = dailyTotals([makeExpense({ date: todayIso, amount: 15 })], 3);
    expect(result).toHaveLength(3);
    expect(result[result.length - 1]).toEqual({ date: todayIso, total: 15 });
    expect(result[0].total).toBe(0);
  });
});

describe("currentStreak", () => {
  it("returns 0 when no budget is set", () => {
    expect(currentStreak([], null)).toBe(0);
  });

  it("returns 0 when today alone is already over budget", () => {
    const todayIso = new Date().toISOString().slice(0, 10);
    expect(currentStreak([makeExpense({ date: todayIso, amount: 100 })], 10)).toBe(0);
  });

  it("counts a day with no logged expenses as a win", () => {
    expect(currentStreak([], 10)).toBeGreaterThan(0);
  });
});
