import type { Expense, Settings } from "./types";
import { amountToHours, formatHours } from "./time-cost";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function expensesToCsv(expenses: Expense[], settings: Settings): string {
  const header = ["Date", "Category", "Description", "Amount", "Hours of work"];
  const rows = expenses.map((e) => {
    const hours = amountToHours(e.amount, settings);
    return [
      e.date,
      e.category,
      escapeCsvField(e.description),
      e.amount.toFixed(2),
      hours === null ? "" : formatHours(hours),
    ];
  });
  return [header, ...rows].map((row) => row.join(",")).join("\n");
}

export function downloadCsv(expenses: Expense[], settings: Settings, filename?: string): void {
  const csv = expensesToCsv(expenses, settings);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = filename ?? `hourglass-expenses-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Data export V1 (dashboard "Export Data" button). Deliberately separate
 * from expensesToCsv/downloadCsv above: a plain Date/Category/Amount/
 * Description export with no settings dependency, per the v1 spec of
 * "simple, just the basics." Hours-of-work and other columns can be added
 * in a later version without touching this one.
 */
export function exportExpensesToCsv(expenses: Expense[]): void {
  const header = ["Date", "Category", "Amount", "Description"];
  const rows = expenses.map((e) => [e.date, e.category, e.amount.toFixed(2), escapeCsvField(e.description)]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `expenses-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
