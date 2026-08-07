"use client";

import { useCallback, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import type { Expense, ExpenseInput } from "@/lib/types";
import * as store from "@/lib/expenseStore";
import { useIsClient } from "./useIsClient";

const PERSIST_WARNING =
  "This browser couldn't save your data (private/incognito mode or storage is full). Changes will be lost on reload.";

export function useExpenses() {
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

  return {
    expenses,
    isLoading: !isClient,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    loadSampleData,
  };
}
