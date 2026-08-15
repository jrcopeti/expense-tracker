import type { ExportPayload } from "../types";
import { sumExpenses } from "../filters";

export function buildJsonBlob(payload: ExportPayload): Blob {
  const envelope = {
    exportedAt: payload.generatedAt.toISOString(),
    filters: {
      startDate: payload.filters.startDate || null,
      endDate: payload.filters.endDate || null,
      categories: payload.filters.categories === "all" ? "all" : payload.filters.categories,
    },
    count: payload.expenses.length,
    total: Math.round(sumExpenses(payload.expenses) * 100) / 100,
    expenses: payload.expenses.map((e) => ({
      id: e.id,
      date: e.date,
      category: e.category,
      amount: e.amount,
      description: e.description,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    })),
  };
  return new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json;charset=utf-8;" });
}
