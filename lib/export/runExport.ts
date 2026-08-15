import type { Expense } from "@/lib/types";
import type { ExportOptions, ExportResult, ExportPayload } from "./types";
import { FORMAT_META } from "./types";
import { selectExpensesForExport, sumExpenses } from "./filters";
import { downloadBlob, sanitizeFilename } from "./download";
import { buildCsvBlob } from "./serializers/csv";
import { buildJsonBlob } from "./serializers/json";
import { buildPdfBlob } from "./serializers/pdf";

/**
 * The single entry point the UI calls. Filters, serializes, and triggers the
 * download - async throughout (even CSV/JSON, which resolve almost
 * instantly) so the drawer's loading state is one code path for every
 * format, not a special case for PDF.
 */
export async function runExport(allExpenses: Expense[], options: ExportOptions): Promise<ExportResult> {
  const expenses = selectExpensesForExport(allExpenses, options.filters);
  const payload: ExportPayload = { expenses, filters: options.filters, generatedAt: new Date() };

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
