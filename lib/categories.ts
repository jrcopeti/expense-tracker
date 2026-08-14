import {
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Receipt,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "./types";

interface CategoryMeta {
  label: Category;
  icon: LucideIcon;
  /** CSS custom property that resolves to the right hex for the active color scheme. */
  cssVar: string;
  /** Keywords the quick-capture parser matches against (lowercase, longest-first). */
  keywords: string[];
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    label: "Food",
    icon: Utensils,
    cssVar: "var(--cat-food)",
    keywords: [
      "coffee", "lunch", "dinner", "breakfast", "brunch", "grocery", "groceries",
      "restaurant", "snack", "food", "cafe", "takeout", "pizza", "sushi", "bar",
      "drinks", "starbucks", "trader joe", "whole foods", "doordash", "ubereats",
    ],
  },
  Transportation: {
    label: "Transportation",
    icon: Car,
    cssVar: "var(--cat-transportation)",
    keywords: [
      "uber", "lyft", "gas", "fuel", "parking", "taxi", "train", "bus", "transit",
      "flight", "car", "toll", "subway", "metro", "rideshare",
    ],
  },
  Entertainment: {
    label: "Entertainment",
    icon: Film,
    cssVar: "var(--cat-entertainment)",
    keywords: [
      "movie", "concert", "netflix", "spotify", "game", "tickets", "show",
      "bowling", "streaming", "hulu", "disney+", "steam",
    ],
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    cssVar: "var(--cat-shopping)",
    keywords: [
      "amazon", "clothes", "clothing", "shoes", "jacket", "shopping", "mall",
      "store", "target", "ikea",
    ],
  },
  Bills: {
    label: "Bills",
    icon: Receipt,
    cssVar: "var(--cat-bills)",
    keywords: [
      "rent", "electricity", "water bill", "internet", "phone bill", "insurance",
      "bill", "subscription", "utilities", "mortgage",
    ],
  },
  Other: {
    label: "Other",
    icon: MoreHorizontal,
    cssVar: "var(--cat-other)",
    keywords: [],
  },
};
