import type { Expense, ExpenseInput } from "./types";
import { loadExpenses, saveExpenses } from "./storage";

/**
 * A tiny vanilla store outside React, read via useSyncExternalStore. This is
 * the idiomatic way to synchronize component state with an external system
 * (localStorage) - it hydrates lazily on first read and notifies subscribers
 * on mutation, so no component ever needs to call setState from inside a
 * useEffect body just to mirror this data.
 */

type Listener = () => void;

const EMPTY: Expense[] = [];
const listeners = new Set<Listener>();
let cache: Expense[] | null = null;

function readCache(): Expense[] {
  if (cache === null) {
    cache = loadExpenses();
  }
  return cache;
}

function commit(next: Expense[]): boolean {
  cache = next;
  const persisted = saveExpenses(next);
  listeners.forEach((listener) => listener());
  return persisted;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): Expense[] {
  return readCache();
}

export function getServerSnapshot(): Expense[] {
  return EMPTY;
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function addExpense(input: ExpenseInput): { expense: Expense; persisted: boolean } {
  const now = new Date().toISOString();
  const expense: Expense = { id: makeId(), createdAt: now, updatedAt: now, ...input };
  const persisted = commit([expense, ...readCache()]);
  return { expense, persisted };
}

export function updateExpense(id: string, input: ExpenseInput): boolean {
  const next = readCache().map((e) =>
    e.id === id ? { ...e, ...input, updatedAt: new Date().toISOString() } : e,
  );
  return commit(next);
}

export function deleteExpense(id: string): boolean {
  return commit(readCache().filter((e) => e.id !== id));
}

export function clearAllExpenses(): boolean {
  return commit([]);
}

export function loadSampleData(): boolean {
  return commit(buildSampleExpenses());
}

function buildSampleExpenses(): Expense[] {
  const samples: Array<[daysAgo: number, amount: number, category: Expense["category"], description: string]> = [
    [1, 42.5, "Food", "Grocery run at Trader Joe's"],
    [2, 18.0, "Transportation", "Ride share to downtown"],
    [3, 65.99, "Entertainment", "Concert tickets"],
    [5, 120.0, "Bills", "Electricity bill"],
    [6, 89.32, "Shopping", "New running shoes"],
    [8, 24.75, "Food", "Lunch with the team"],
    [10, 15.4, "Transportation", "Gas station fill-up"],
    [12, 200.0, "Bills", "Internet & phone bundle"],
    [14, 34.2, "Entertainment", "Streaming subscriptions"],
    [16, 58.6, "Food", "Weekly groceries"],
    [18, 12.0, "Other", "Parking meter"],
    [21, 149.99, "Shopping", "Winter jacket"],
    [25, 9.5, "Food", "Coffee and pastry"],
    [28, 76.0, "Transportation", "Monthly transit pass"],
    [33, 45.0, "Entertainment", "Movie night"],
    [38, 210.0, "Bills", "Health insurance top-up"],
    [42, 63.25, "Food", "Dinner out"],
    [47, 27.8, "Shopping", "Books"],
    [52, 95.0, "Bills", "Water & utilities"],
    [58, 31.1, "Other", "Donation"],
    [65, 40.0, "Transportation", "Car wash & detailing"],
    [72, 88.4, "Food", "Groceries"],
    [80, 55.0, "Entertainment", "Bowling night"],
    [95, 130.0, "Shopping", "Home supplies"],
    [110, 175.0, "Bills", "Renters insurance"],
  ];

  const now = new Date();
  return samples.map(([daysAgo, amount, category, description], index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    const iso = date.toISOString();
    return {
      id: `sample_${index}_${makeId()}`,
      date: iso.slice(0, 10),
      amount,
      category,
      description,
      createdAt: iso,
      updatedAt: iso,
    };
  });
}
