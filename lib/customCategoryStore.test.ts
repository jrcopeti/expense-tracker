import { beforeEach, describe, expect, it } from "vitest";
import { addCustomCategory, deleteCustomCategory, getSnapshot, getServerSnapshot, subscribe } from "./customCategoryStore";
import { loadCustomCategories } from "./storage";

// Integration test: exercises the store's in-memory cache together with real
// persistence through lib/storage.ts into (jsdom's) localStorage, the way
// hooks/useCategories.ts actually uses it - not just the pure functions in
// isolation. The store caches state at module scope, so each test cleans up
// after itself (rather than resetting modules) to stay independent.
beforeEach(() => {
  for (const category of getSnapshot()) deleteCustomCategory(category.id);
  window.localStorage.clear();
});

describe("customCategoryStore", () => {
  it("starts empty", () => {
    expect(getSnapshot()).toEqual([]);
  });

  it("getServerSnapshot always returns an empty array (SSR-safe)", () => {
    expect(getServerSnapshot()).toEqual([]);
  });

  it("adds a category, updates the snapshot, and persists it to storage", () => {
    const { category, persisted } = addCustomCategory("Subscriptions", "gift");
    expect(persisted).toBe(true);
    expect(category).toMatchObject({ label: "Subscriptions", iconId: "gift", colorSlot: 0, keywords: ["subscriptions"] });

    // Visible on the in-memory snapshot...
    expect(getSnapshot()).toEqual([category]);
    // ...and durably persisted, independent of the store's own cache.
    expect(loadCustomCategories()).toEqual([category]);
  });

  it("slugifies the label into an id that doesn't collide with a built-in category", () => {
    const { category } = addCustomCategory("Food Truck Fridays");
    expect(category.id).toBe("food-truck-fridays");
  });

  it("disambiguates a duplicate slug with a numeric suffix", () => {
    const first = addCustomCategory("Pets").category;
    const second = addCustomCategory("Pets!!").category; // slugifies to the same base
    expect(first.id).toBe("pets");
    expect(second.id).toBe("pets-2");
  });

  it("assigns the two reserved color slots in order, then null once both are taken", () => {
    const a = addCustomCategory("A").category;
    const b = addCustomCategory("B").category;
    const c = addCustomCategory("C").category;
    expect([a.colorSlot, b.colorSlot, c.colorSlot]).toEqual([0, 1, null]);
  });

  it("reassigns the freed slot when its holder is deleted, without colliding with the surviving one", () => {
    const a = addCustomCategory("A").category; // slot 0
    const b = addCustomCategory("B").category; // slot 1
    deleteCustomCategory(a.id);
    const c = addCustomCategory("C").category;
    expect(c.colorSlot).toBe(0); // the freed slot, not colliding with b's slot 1
    expect(getSnapshot().find((cat) => cat.id === b.id)?.colorSlot).toBe(1);
  });

  it("notifies subscribers when a category is added or deleted", () => {
    let notifications = 0;
    const unsubscribe = subscribe(() => {
      notifications += 1;
    });

    const { category } = addCustomCategory("Notify Me");
    expect(notifications).toBe(1);

    deleteCustomCategory(category.id);
    expect(notifications).toBe(2);

    unsubscribe();
    addCustomCategory("After Unsubscribe");
    expect(notifications).toBe(2); // no further notifications once unsubscribed
  });

  it("deleteCustomCategory removes the category from both cache and storage", () => {
    const { category } = addCustomCategory("Temporary");
    expect(deleteCustomCategory(category.id)).toBe(true);
    expect(getSnapshot()).toEqual([]);
    expect(loadCustomCategories()).toEqual([]);
  });
});
