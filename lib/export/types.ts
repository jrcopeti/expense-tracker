import type { Category, Expense } from "@/lib/types";

export const EXPORT_FORMATS = ["csv", "json", "pdf"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const FORMAT_META: Record<ExportFormat, { label: string; extension: string; mime: string }> = {
  csv: { label: "CSV", extension: "csv", mime: "text/csv;charset=utf-8;" },
  json: { label: "JSON", extension: "json", mime: "application/json;charset=utf-8;" },
  pdf: { label: "PDF", extension: "pdf", mime: "application/pdf" },
};

export interface ExportFilters {
  startDate: string; // "" = no lower bound
  endDate: string; // "" = no upper bound
  categories: Category[] | "all";
}

export const DEFAULT_EXPORT_FILTERS: ExportFilters = {
  startDate: "",
  endDate: "",
  categories: "all",
};

export interface ExportOptions {
  format: ExportFormat;
  filters: ExportFilters;
  filename: string; // base name, no extension
}

export interface ExportResult {
  count: number;
  total: number;
  filename: string;
}

/** What every serializer receives - the already-filtered rows plus context for report headers. */
export interface ExportPayload {
  expenses: Expense[];
  filters: ExportFilters;
  generatedAt: Date;
  reportTitle?: string;
}
