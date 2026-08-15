import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, renderHook, act } from "@testing-library/react";
import { useCategories } from "./useCategories";
import { getSnapshot, deleteCustomCategory } from "@/lib/customCategoryStore";

// Integration test across the full useCategories stack: the hook, the
// vanilla customCategoryStore (via useSyncExternalStore), and real
// persistence through lib/storage.ts into (jsdom's) localStorage - the same
// path components/expenses/ExpenseFormModal.tsx exercises when a user adds a
// category from the UI.
beforeEach(() => {
  for (const category of getSnapshot()) deleteCustomCategory(category.id);
  window.localStorage.clear();
});

afterEach(cleanup);

describe("useCategories", () => {
  it("lists the six built-in categories with no custom categories yet", () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.options).toHaveLength(6);
    expect(result.current.options.every((o) => !o.isCustom)).toBe(true);
    expect(result.current.validIds).toEqual(["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Other"]);
  });

  it("reports isLoading false once mounted client-side", () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.isLoading).toBe(false);
  });

  it("addCategory rejects a duplicate label without touching the store", () => {
    const { result } = renderHook(() => useCategories());

    let outcome: ReturnType<typeof result.current.addCategory> | undefined;
    act(() => {
      outcome = result.current.addCategory("Food");
    });

    expect(outcome).toEqual({ ok: false, error: "That category already exists." });
    expect(result.current.options).toHaveLength(6);
  });

  it("addCategory adds a category and the hook re-renders with it included", () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      const outcome = result.current.addCategory("Subscriptions", "gift");
      expect(outcome.ok).toBe(true);
    });

    expect(result.current.options).toHaveLength(7);
    const added = result.current.options.find((o) => o.isCustom);
    expect(added?.meta.label).toBe("Subscriptions");
    expect(result.current.validIds).toContain(added?.id);
  });

  it("metaOf resolves both a built-in id and a freshly added custom id", () => {
    const { result } = renderHook(() => useCategories());

    act(() => {
      result.current.addCategory("Subscriptions");
    });

    const customId = result.current.options.find((o) => o.isCustom)!.id;
    expect(result.current.metaOf("Food").label).toBe("Food");
    expect(result.current.metaOf(customId).label).toBe("Subscriptions");
  });

  it("deleteCategory removes a custom category and the hook reflects it", () => {
    const { result } = renderHook(() => useCategories());

    let customId = "";
    act(() => {
      const outcome = result.current.addCategory("Temporary");
      if (outcome.ok) customId = outcome.category.id;
    });

    expect(result.current.options.some((o) => o.id === customId)).toBe(true);

    act(() => {
      result.current.deleteCategory(customId);
    });

    expect(result.current.options.some((o) => o.id === customId)).toBe(false);
  });
});
