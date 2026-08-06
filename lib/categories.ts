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
  /** Raw hex values, used where an SVG fill attribute needs a concrete value (charts). */
  light: string;
  dark: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    label: "Food",
    icon: Utensils,
    cssVar: "var(--cat-food)",
    light: "#2a78d6",
    dark: "#3987e5",
  },
  Transportation: {
    label: "Transportation",
    icon: Car,
    cssVar: "var(--cat-transportation)",
    light: "#eb6834",
    dark: "#d95926",
  },
  Entertainment: {
    label: "Entertainment",
    icon: Film,
    cssVar: "var(--cat-entertainment)",
    light: "#1baf7a",
    dark: "#199e70",
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    cssVar: "var(--cat-shopping)",
    light: "#eda100",
    dark: "#c98500",
  },
  Bills: {
    label: "Bills",
    icon: Receipt,
    cssVar: "var(--cat-bills)",
    light: "#e87ba4",
    dark: "#d55181",
  },
  Other: {
    label: "Other",
    icon: MoreHorizontal,
    cssVar: "var(--cat-other)",
    light: "#008300",
    dark: "#008300",
  },
};
