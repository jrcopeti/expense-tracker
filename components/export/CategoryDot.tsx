import { CATEGORY_META } from "@/lib/categories";
import type { Category } from "@/lib/types";

export function CategoryDot({ category }: { category: Category }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: CATEGORY_META[category].cssVar }}
      aria-hidden
    />
  );
}
