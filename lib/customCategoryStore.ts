import { CATEGORIES, type CustomCategory } from "./types";
import { loadCustomCategories, saveCustomCategories } from "./storage";
import { DEFAULT_CATEGORY_ICON_ID, type CategoryIconId } from "./category-icons";

/** Same tiny vanilla-store-outside-React shape as expenseStore.ts - see its header comment. */

type Listener = () => void;

const EMPTY: CustomCategory[] = [];
const listeners = new Set<Listener>();
let cache: CustomCategory[] | null = null;

function readCache(): CustomCategory[] {
  if (cache === null) cache = loadCustomCategories();
  return cache;
}

function commit(next: CustomCategory[]): boolean {
  cache = next;
  const persisted = saveCustomCategories(next);
  listeners.forEach((listener) => listener());
  return persisted;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): CustomCategory[] {
  return readCache();
}

export function getServerSnapshot(): CustomCategory[] {
  return EMPTY;
}

function slugify(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** A slug that doesn't collide with a built-in id or an existing custom one. */
function uniqueId(label: string, existing: CustomCategory[]): string {
  const taken = new Set([
    ...(CATEGORIES as readonly string[]).map((c) => c.toLowerCase()),
    ...existing.map((c) => c.id),
  ]);
  const base = slugify(label) || "category";
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}-${suffix}`)) suffix++;
  return `${base}-${suffix}`;
}

/** Whichever of the two reserved slots isn't currently held by a surviving category, so deleting one and adding another never collides with the one still in use. */
function nextColorSlot(existing: CustomCategory[]): 0 | 1 | null {
  const occupied = new Set(existing.map((c) => c.colorSlot).filter((s): s is 0 | 1 => s !== null));
  if (!occupied.has(0)) return 0;
  if (!occupied.has(1)) return 1;
  return null;
}

/**
 * Adds a category with the given (assumed already-validated, see
 * `lib/validation.ts`'s `validateCategoryLabel`) label. Color slot 0/1 goes
 * to whichever of the two reserved hues is currently free and is never
 * reassigned once given - see `lib/categories.ts` for why the palette can't
 * just grow another hue for a third.
 */
export function addCustomCategory(
  label: string,
  iconId: CategoryIconId = DEFAULT_CATEGORY_ICON_ID,
): { category: CustomCategory; persisted: boolean } {
  const existing = readCache();
  const trimmed = label.trim();
  const category: CustomCategory = {
    id: uniqueId(trimmed, existing),
    label: trimmed,
    colorSlot: nextColorSlot(existing),
    iconId,
    keywords: [trimmed.toLowerCase()],
    createdAt: new Date().toISOString(),
  };
  const persisted = commit([...existing, category]);
  return { category, persisted };
}

export function deleteCustomCategory(id: string): boolean {
  return commit(readCache().filter((c) => c.id !== id));
}
