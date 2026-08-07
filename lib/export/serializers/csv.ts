import type { ExportPayload } from "../types";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function buildCsvBlob(payload: ExportPayload): Blob {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = payload.expenses.map((e) => [
    e.date,
    e.category,
    escapeCsvField(e.description),
    e.amount.toFixed(2),
  ]);
  const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
  return new Blob([csv], { type: "text/csv;charset=utf-8;" });
}
