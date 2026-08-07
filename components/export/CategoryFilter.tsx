import clsx from "clsx";
import { CATEGORIES, type Category } from "@/lib/types";
import { CATEGORY_META } from "@/lib/categories";

interface CategoryFilterProps {
  selected: Category[] | "all";
  onToggle: (category: Category) => void;
  onSelectAll: () => void;
}

export function CategoryFilter({ selected, onToggle, onSelectAll }: CategoryFilterProps) {
  const isAll = selected === "all";

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={onSelectAll}
        className={clsx(
          "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
          isAll ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-secondary hover:bg-surface-hover",
        )}
      >
        All categories
      </button>
      {CATEGORIES.map((category) => {
        const isSelected = !isAll && selected.includes(category);
        const meta = CATEGORY_META[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            aria-pressed={isSelected}
            className={clsx(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              isSelected ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface text-secondary hover:bg-surface-hover",
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: meta.cssVar }}
              aria-hidden
            />
            {category}
          </button>
        );
      })}
    </div>
  );
}
