import { useReducer } from "react";
import type { Category } from "@/lib/types";
import type { ExportFilters, ExportFormat } from "@/lib/export/types";
import { DEFAULT_EXPORT_FILTERS } from "@/lib/export/types";
import { resolvePreset, type RangePreset } from "@/lib/export/filters";
import { todayIso } from "@/lib/format";

export interface ExportFormState {
  format: ExportFormat;
  filters: ExportFilters;
  filename: string;
  status: "idle" | "exporting" | "done" | "error";
  errorMessage: string | null;
}

type Action =
  | { type: "SET_FORMAT"; format: ExportFormat }
  | { type: "SET_START_DATE"; date: string }
  | { type: "SET_END_DATE"; date: string }
  | { type: "APPLY_PRESET"; preset: RangePreset }
  | { type: "TOGGLE_CATEGORY"; category: Category }
  | { type: "SET_ALL_CATEGORIES" }
  | { type: "SET_FILENAME"; filename: string }
  | { type: "EXPORT_START" }
  | { type: "EXPORT_SUCCESS" }
  | { type: "EXPORT_ERROR"; message: string };

function defaultFilename(): string {
  return `hourglass-export-${todayIso()}`;
}

function initialState(): ExportFormState {
  return {
    format: "csv",
    filters: DEFAULT_EXPORT_FILTERS,
    filename: defaultFilename(),
    status: "idle",
    errorMessage: null,
  };
}

function reducer(state: ExportFormState, action: Action): ExportFormState {
  switch (action.type) {
    case "SET_FORMAT":
      return { ...state, format: action.format };
    case "SET_START_DATE":
      return { ...state, filters: { ...state.filters, startDate: action.date } };
    case "SET_END_DATE":
      return { ...state, filters: { ...state.filters, endDate: action.date } };
    case "APPLY_PRESET":
      return { ...state, filters: { ...state.filters, ...resolvePreset(action.preset) } };
    case "TOGGLE_CATEGORY": {
      const current = state.filters.categories;
      const all: Category[] = current === "all" ? [] : current;
      const next = all.includes(action.category)
        ? all.filter((c) => c !== action.category)
        : [...all, action.category];
      return { ...state, filters: { ...state.filters, categories: next.length === 0 ? "all" : next } };
    }
    case "SET_ALL_CATEGORIES":
      return { ...state, filters: { ...state.filters, categories: "all" } };
    case "SET_FILENAME":
      return { ...state, filename: action.filename };
    case "EXPORT_START":
      return { ...state, status: "exporting", errorMessage: null };
    case "EXPORT_SUCCESS":
      return { ...state, status: "done" };
    case "EXPORT_ERROR":
      return { ...state, status: "error", errorMessage: action.message };
    default:
      return state;
  }
}

export function useExportForm() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  return { state, dispatch };
}
