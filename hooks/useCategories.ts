"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { CATEGORIES, type BuiltInCategory, type CustomCategory } from "@/lib/types";
import { CATEGORY_META, resolveCategoryMeta, type CategoryMeta } from "@/lib/categories";
import { validateCategoryLabel } from "@/lib/validation";
import * as store from "@/lib/customCategoryStore";
import { useIsClient } from "./useIsClient";

const PERSIST_WARNING = "This browser couldn't save your new category. It'll reset on reload.";

export interface CategoryOption {
  id: BuiltInCategory | string;
  meta: CategoryMeta;
  isCustom: boolean;
}

export type AddCategoryResult = { ok: true; category: CustomCategory } | { ok: false; error: string };

/**
 * Built-in categories plus whatever the user has created, merged into one
 * list. Every id (built-in or custom) resolves through `metaOf` /
 * `resolveCategoryMeta`, so a component never needs to know which kind of
 * category it's looking at.
 */
export function useCategories() {
  const customCategories = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const isClient = useIsClient();

  const options: CategoryOption[] = useMemo(
    () => [
      ...CATEGORIES.map((id) => ({ id, meta: CATEGORY_META[id], isCustom: false })),
      ...customCategories.map((c) => ({ id: c.id, meta: resolveCategoryMeta(c.id, customCategories), isCustom: true })),
    ],
    [customCategories],
  );

  const validIds = useMemo(() => options.map((o) => o.id), [options]);

  const metaOf = useCallback((id: string) => resolveCategoryMeta(id, customCategories), [customCategories]);

  const addCategory = useCallback(
    (label: string): AddCategoryResult => {
      const existingLabels = [...CATEGORIES, ...customCategories.map((c) => c.label)];
      const error = validateCategoryLabel(label, existingLabels);
      if (error) return { ok: false, error };

      const { category, persisted } = store.addCustomCategory(label);
      if (!persisted) toast.error(PERSIST_WARNING);
      return { ok: true, category };
    },
    [customCategories],
  );

  const deleteCategory = useCallback((id: string) => {
    if (!store.deleteCustomCategory(id)) toast.error(PERSIST_WARNING);
  }, []);

  return { customCategories, options, validIds, metaOf, addCategory, deleteCategory, isLoading: !isClient };
}
