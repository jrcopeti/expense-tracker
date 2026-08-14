"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { Expense, ExpenseInput } from "@/lib/types";
import * as store from "@/lib/expenseStore";
import { useIsClient } from "@/hooks/useIsClient";

interface ExpenseContextValue {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (input: ExpenseInput) => Expense;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => void;
  loadSampleData: () => void;
  clearAllExpenses: () => void;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

const PERSIST_WARNING =
  "This browser couldn't save your data (private/incognito mode or storage is full). Changes will be lost on reload.";

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const expenses = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const addExpense = useCallback((input: ExpenseInput): Expense => {
    const { expense, persisted } = store.addExpense(input);
    if (!persisted) toast.error(PERSIST_WARNING);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    if (!store.updateExpense(id, input)) toast.error(PERSIST_WARNING);
  }, []);

  const deleteExpense = useCallback((id: string) => {
    if (!store.deleteExpense(id)) toast.error(PERSIST_WARNING);
  }, []);

  const clearAllExpenses = useCallback(() => {
    if (!store.clearAllExpenses()) toast.error(PERSIST_WARNING);
  }, []);

  const loadSampleData = useCallback(() => {
    if (!store.loadSampleData()) toast.error(PERSIST_WARNING);
  }, []);

  const value = useMemo<ExpenseContextValue>(
    () => ({
      expenses,
      isLoading: !isClient,
      addExpense,
      updateExpense,
      deleteExpense,
      loadSampleData,
      clearAllExpenses,
    }),
    [expenses, isClient, addExpense, updateExpense, deleteExpense, loadSampleData, clearAllExpenses],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses(): ExpenseContextValue {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error("useExpenses must be used within an ExpenseProvider");
  return ctx;
}
