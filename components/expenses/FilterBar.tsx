"use client";

import { Search, X } from "lucide-react";
import { CATEGORIES, DEFAULT_FILTERS, type ExpenseFilters, type SortKey } from "@/lib/types";
import { fieldClasses } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

interface FilterBarProps {
  filters: ExpenseFilters;
  onChange: (filters: ExpenseFilters) => void;
}

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "date-desc", label: "Newest first" },
  { value: "date-asc", label: "Oldest first" },
  { value: "amount-desc", label: "Amount: high to low" },
  { value: "amount-asc", label: "Amount: low to high" },
];

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const isActive =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  function set<K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:flex-wrap">
        <div className="flex min-w-[180px] flex-1 flex-col gap-1.5">
          <label htmlFor="filter-search" className="text-xs font-medium text-secondary">
            Search
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              id="filter-search"
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => set("search", e.target.value)}
              className={fieldClasses() + " pl-9"}
            />
          </div>
        </div>

        <div className="flex min-w-[150px] flex-col gap-1.5">
          <label htmlFor="filter-category" className="text-xs font-medium text-secondary">
            Category
          </label>
          <select
            id="filter-category"
            value={filters.category}
            onChange={(e) => set("category", e.target.value as ExpenseFilters["category"])}
            className={fieldClasses()}
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex min-w-[140px] flex-col gap-1.5">
          <label htmlFor="filter-start" className="text-xs font-medium text-secondary">
            From
          </label>
          <input
            id="filter-start"
            type="date"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(e) => set("startDate", e.target.value)}
            className={fieldClasses()}
          />
        </div>

        <div className="flex min-w-[140px] flex-col gap-1.5">
          <label htmlFor="filter-end" className="text-xs font-medium text-secondary">
            To
          </label>
          <input
            id="filter-end"
            type="date"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(e) => set("endDate", e.target.value)}
            className={fieldClasses()}
          />
        </div>

        <div className="flex min-w-[170px] flex-col gap-1.5">
          <label htmlFor="filter-sort" className="text-xs font-medium text-secondary">
            Sort by
          </label>
          <select
            id="filter-sort"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value as SortKey)}
            className={fieldClasses()}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {isActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange({ ...DEFAULT_FILTERS, sort: filters.sort })}
            className="md:mb-0.5"
          >
            <X className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
