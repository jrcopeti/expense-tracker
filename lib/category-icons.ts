import {
  Tag,
  ShoppingCart,
  Coffee,
  Home,
  Heart,
  Briefcase,
  Gift,
  Plane,
  Dumbbell,
  PawPrint,
  Music,
  Book,
  Wrench,
  Gamepad2,
  Palette,
  Star,
  type LucideIcon,
} from "lucide-react";

/**
 * The icons a user can pick from when creating a category. A small, fixed
 * set (not "any lucide icon") so the picker stays scannable and every id
 * is stable to persist - see `CustomCategory.iconId` in `lib/types.ts`.
 */
export const CATEGORY_ICONS = {
  tag: Tag,
  cart: ShoppingCart,
  coffee: Coffee,
  home: Home,
  heart: Heart,
  briefcase: Briefcase,
  gift: Gift,
  plane: Plane,
  dumbbell: Dumbbell,
  pet: PawPrint,
  music: Music,
  book: Book,
  wrench: Wrench,
  game: Gamepad2,
  art: Palette,
  star: Star,
} as const satisfies Record<string, LucideIcon>;

export type CategoryIconId = keyof typeof CATEGORY_ICONS;

export const CATEGORY_ICON_IDS = Object.keys(CATEGORY_ICONS) as CategoryIconId[];

/** Used for a brand-new category with no choice made yet, and as the safe fallback for an unrecognized/old `iconId`. */
export const DEFAULT_CATEGORY_ICON_ID: CategoryIconId = "tag";

export function isCategoryIconId(id: string): id is CategoryIconId {
  return Object.hasOwn(CATEGORY_ICONS, id);
}
