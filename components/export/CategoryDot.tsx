"use client";

import { useCategories } from "@/hooks/useCategories";
import type { Category } from "@/lib/types";

export function CategoryDot({ category }: { category: Category }) {
  const { metaOf } = useCategories();
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: metaOf(category).cssVar }}
      aria-hidden
    />
  );
}
