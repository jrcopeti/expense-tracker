import type { Expense } from "./types";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function expensesToCsv(expenses: Expense[]): string {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [
    e.date,
    e.category,
    escapeCsvField(e.description),
    e.amount.toFixed(2),
  ]);
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadCsv(expenses: Expense[], filename?: string): void {
  const csv = expensesToCsv(expenses);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = filename ?? `expenses-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
