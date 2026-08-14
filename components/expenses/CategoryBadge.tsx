import clsx from "clsx";
import { CATEGORY_META } from "@/lib/categories";
import type { Category } from "@/lib/types";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md";
  className?: string;
}

export function CategoryBadge({ category, size = "md", className }: CategoryBadgeProps) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  const isSmall = size === "sm";

  return (
    <span className={clsx("inline-flex items-center gap-2", className)}>
      <span
        className={clsx("flex shrink-0 items-center justify-center rounded-full", isSmall ? "h-6 w-6" : "h-8 w-8")}
        style={{ backgroundColor: `color-mix(in srgb, ${meta.cssVar} 16%, transparent)` }}
      >
        <Icon className={isSmall ? "h-3.5 w-3.5" : "h-4 w-4"} strokeWidth={2} style={{ color: meta.cssVar }} />
      </span>
      <span className={clsx("font-medium text-foreground", isSmall ? "text-xs" : "text-sm")}>{meta.label}</span>
    </span>
  );
}
