import type { Expense } from "@/lib/types";
import type { ExportOptions, ExportResult, ExportPayload } from "./types";
import { FORMAT_META } from "./types";
import { selectExpensesForExport, sumExpenses } from "./filters";
import { downloadBlob, sanitizeFilename } from "./download";
import { buildCsvBlob } from "./serializers/csv";
import { buildJsonBlob } from "./serializers/json";
import { buildPdfBlob } from "./serializers/pdf";

/**
 * The single entry point every part of the export system calls - quick
 * templates, the scheduled-backup runner, and (indirectly, via the shared
 * report) the share flow. Filters, serializes, and triggers the download;
 * async throughout so callers don't special-case PDF's dynamic import.
 */
export async function runExport(
  allExpenses: Expense[],
  options: ExportOptions & { reportTitle?: string },
): Promise<ExportResult> {
  const expenses = selectExpensesForExport(allExpenses, options.filters);
  const payload: ExportPayload = {
    expenses,
    filters: options.filters,
    generatedAt: new Date(),
    reportTitle: options.reportTitle,
  };

  const blob = await buildBlob(options, payload);
  const filename = `${sanitizeFilename(options.filename)}.${FORMAT_META[options.format].extension}`;
  downloadBlob(blob, filename);

  return { count: expenses.length, total: sumExpenses(expenses), filename };
}

async function buildBlob(options: ExportOptions, payload: ExportPayload): Promise<Blob> {
  switch (options.format) {
    case "csv":
      return buildCsvBlob(payload);
    case "json":
      return buildJsonBlob(payload);
    case "pdf":
      return buildPdfBlob(payload);
  }
}
