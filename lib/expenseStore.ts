import type { Expense, ExpenseInput } from "./types";
import { loadExpenses, saveExpenses } from "./storage";

/**
 * A tiny vanilla store outside React, read via useSyncExternalStore. Hydrates
 * lazily on first read and notifies subscribers on mutation, so no component
 * needs to call setState from inside a useEffect body just to mirror this
 * localStorage-backed data (which is what current React/Next lint rules ask
 * for anyway - see useIsClient for the same trick applied to hydration).
 */

type Listener = () => void;

const EMPTY: Expense[] = [];
const listeners = new Set<Listener>();
let cache: Expense[] | null = null;

function readCache(): Expense[] {
  if (cache === null) cache = loadExpenses();
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
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
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
  // Six-ish months of realistic, slightly bursty activity - including a few
  // genuine no-spend days, so the heatmap and streak features have something
  // to show off out of the box.
  const samples: Array<[daysAgo: number, amount: number, category: Expense["category"], description: string]> = [
    [0, 6.25, "Food", "Coffee"],
    [1, 42.5, "Food", "Grocery run at Trader Joe's"],
    [1, 18.0, "Transportation", "Ride share to downtown"],
    [2, 65.99, "Entertainment", "Concert tickets"],
    [3, 12.4, "Food", "Lunch"],
    [4, 120.0, "Bills", "Electricity bill"],
    [4, 89.32, "Shopping", "New running shoes"],
    [6, 24.75, "Food", "Lunch with the team"],
    [7, 4.5, "Food", "Coffee"],
    [8, 15.4, "Transportation", "Gas station fill-up"],
    [10, 200.0, "Bills", "Internet & phone bundle"],
    [11, 34.2, "Entertainment", "Streaming subscriptions"],
    [12, 58.6, "Food", "Weekly groceries"],
    [14, 12.0, "Other", "Parking meter"],
    [16, 149.99, "Shopping", "Winter jacket"],
    [17, 5.75, "Food", "Coffee"],
    [19, 9.5, "Food", "Coffee and pastry"],
    [21, 76.0, "Transportation", "Monthly transit pass"],
    [23, 45.0, "Entertainment", "Movie night"],
    [25, 6.0, "Food", "Coffee"],
    [27, 210.0, "Bills", "Health insurance top-up"],
    [29, 63.25, "Food", "Dinner out"],
    [32, 27.8, "Shopping", "Books"],
    [35, 95.0, "Bills", "Water & utilities"],
    [38, 31.1, "Other", "Donation"],
    [41, 40.0, "Transportation", "Car wash & detailing"],
    [44, 88.4, "Food", "Groceries"],
    [48, 55.0, "Entertainment", "Bowling night"],
    [55, 130.0, "Shopping", "Home supplies"],
    [62, 175.0, "Bills", "Renters insurance"],
    [70, 22.0, "Food", "Takeout"],
    [80, 68.0, "Transportation", "Flight change fee"],
    [95, 41.5, "Food", "Groceries"],
    [110, 29.99, "Entertainment", "Video game"],
    [130, 210.0, "Bills", "Car insurance"],
    [150, 76.4, "Shopping", "Amazon order"],
    [175, 33.2, "Food", "Dinner out"],
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
