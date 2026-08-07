import { Landmark, CalendarRange, ChartPie, type LucideIcon } from "lucide-react";
import type { ExportFilters, ExportFormat } from "@/lib/export/types";
import { resolvePreset } from "@/lib/export/filters";

export interface ExportTemplate {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  format: ExportFormat;
  reportTitle: string;
  buildFilters: () => ExportFilters;
}

export const EXPORT_TEMPLATES: ExportTemplate[] = [
  {
    id: "tax-report",
    label: "Tax Report",
    description: "This year, every category, as a PDF ready to hand to your accountant.",
    icon: Landmark,
    format: "pdf",
    reportTitle: `Tax Report ${new Date().getFullYear()}`,
    buildFilters: () => ({ ...resolvePreset("year"), categories: "all" }),
  },
  {
    id: "monthly-summary",
    label: "Monthly Summary",
    description: "This month's activity, as a clean CSV for a quick review.",
    icon: CalendarRange,
    format: "csv",
    reportTitle: "Monthly Summary",
    buildFilters: () => ({ ...resolvePreset("month"), categories: "all" }),
  },
  {
    id: "category-analysis",
    label: "Category Analysis",
    description: "Everything you've ever logged, as JSON for spreadsheets or scripts.",
    icon: ChartPie,
    format: "json",
    reportTitle: "Category Analysis",
    buildFilters: () => ({ startDate: "", endDate: "", categories: "all" }),
  },
];
