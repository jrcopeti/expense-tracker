import { Utensils, Car, Film, ShoppingBag, Receipt, MoreHorizontal, type LucideIcon } from "lucide-react";
import { CATEGORIES, type BuiltInCategory, type CustomCategory } from "./types";
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON_ID, isCategoryIconId } from "./category-icons";

export interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** CSS custom property that resolves to the right hex for the active color scheme. */
  cssVar: string;
  /** Keywords the quick-capture parser matches against (lowercase, longest-first). */
  keywords: string[];
}

export const CATEGORY_META: Record<BuiltInCategory, CategoryMeta> = {
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

/**
 * The two extra fixed hues (violet, red) reserved for user-created
 * categories - slots 7-8 of the same validated, colorblind-checked
 * categorical order the six built-ins use (slots 1-6). Assigned once per
 * `CustomCategory` at creation (`colorSlot`) and never reassigned.
 *
 * This is a hard cap, not a starting point: a palette's colorblind
 * separation is only validated for its documented, fixed-order hues, so a
 * 9th distinct color is never generated on the fly. Categories beyond the
 * first two custom ones use `FALLBACK_CATEGORY_CSS_VAR` instead - told
 * apart by label (and icon), not by a color that was never checked against
 * the rest of the set.
 */
export const CUSTOM_CATEGORY_COLOR_VARS = ["var(--cat-custom-1)", "var(--cat-custom-2)"] as const;

/** Neutral, mode-invariant color for a category with no reserved slot left, or for a deleted category an old expense still references. */
export const FALLBACK_CATEGORY_CSS_VAR = "var(--text-muted)";

export function isBuiltInCategory(id: string): id is BuiltInCategory {
  return (CATEGORIES as readonly string[]).includes(id);
}

/** The icon for a custom category's `iconId` - falls back to the default for a missing id (categories created before icon selection existed) or an unrecognized one (the icon set changed). */
function resolveCustomIcon(iconId: string | undefined): LucideIcon {
  return CATEGORY_ICONS[iconId !== undefined && isCategoryIconId(iconId) ? iconId : DEFAULT_CATEGORY_ICON_ID];
}

/**
 * Resolves any category id - built-in or custom - to something safe to
 * render. Falls back gracefully (default icon, muted color, raw id as
 * label) for an id that matches neither, which happens when an expense
 * still references a custom category that was since deleted.
 */
export function resolveCategoryMeta(id: string, customCategories: CustomCategory[]): CategoryMeta {
  if (isBuiltInCategory(id)) return CATEGORY_META[id];

  const custom = customCategories.find((c) => c.id === id);
  if (!custom) {
    return { label: id, icon: resolveCustomIcon(undefined), cssVar: FALLBACK_CATEGORY_CSS_VAR, keywords: [] };
  }

  return {
    label: custom.label,
    icon: resolveCustomIcon(custom.iconId),
    cssVar: custom.colorSlot === null ? FALLBACK_CATEGORY_CSS_VAR : CUSTOM_CATEGORY_COLOR_VARS[custom.colorSlot],
    keywords: custom.keywords,
  };
}
