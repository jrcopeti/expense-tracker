"use client";

import clsx from "clsx";

export type CategoryRange = "all" | "month";

interface CategoryRangeToggleProps {
  value: CategoryRange;
  onChange: (range: CategoryRange) => void;
}

const RANGE_OPTIONS: Array<{ value: CategoryRange; label: string }> = [
  { value: "all", label: "All time" },
  { value: "month", label: "This month" },
];

export function CategoryRangeToggle({ value, onChange }: CategoryRangeToggleProps) {
  return (
    <div role="group" aria-label="Time range" className="inline-flex rounded-xl border border-border bg-surface p-1">
      {RANGE_OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={clsx(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              isActive ? "bg-accent/10 text-accent" : "text-secondary hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
