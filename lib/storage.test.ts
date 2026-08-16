import { beforeEach, describe, expect, it } from "vitest";
import {
  loadCustomCategories,
  loadExpenses,
  loadSettings,
  saveCustomCategories,
  saveExpenses,
  saveSettings,
} from "./storage";
import { DEFAULT_SETTINGS, type CustomCategory, type Expense } from "./types";

beforeEach(() => {
  window.localStorage.clear();
});

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: "1",
    date: "2026-08-01",
    amount: 10,
    category: "Food",
    description: "Lunch",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("expenses", () => {
  it("returns an empty array when nothing is stored", () => {
    expect(loadExpenses()).toEqual([]);
  });

  it("round-trips a valid expense list through localStorage", () => {
    const expenses = [makeExpense()];
    expect(saveExpenses(expenses)).toBe(true);
    expect(loadExpenses()).toEqual(expenses);
  });

  it("drops malformed entries instead of throwing", () => {
    window.localStorage.setItem(
      "hourglass:expenses:v1",
      JSON.stringify([makeExpense(), { id: "bad", amount: "not a number" }]),
    );
    expect(loadExpenses()).toEqual([makeExpense()]);
  });

  it("returns an empty array for corrupt (non-JSON) data instead of throwing", () => {
    window.localStorage.setItem("hourglass:expenses:v1", "{not json");
    expect(loadExpenses()).toEqual([]);
  });

  it("returns an empty array when the stored value isn't an array", () => {
    window.localStorage.setItem("hourglass:expenses:v1", JSON.stringify({ not: "an array" }));
    expect(loadExpenses()).toEqual([]);
  });
});

describe("settings", () => {
  it("returns DEFAULT_SETTINGS when nothing is stored", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it("round-trips settings and merges with defaults for missing fields", () => {
    expect(saveSettings({ ...DEFAULT_SETTINGS, hourlyWage: 30 })).toBe(true);
    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, hourlyWage: 30 });
  });

  it("falls back to DEFAULT_SETTINGS for corrupt data", () => {
    window.localStorage.setItem("hourglass:settings:v1", "{not json");
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});

describe("custom categories", () => {
  function makeCustomCategory(overrides: Partial<CustomCategory> = {}): CustomCategory {
    return {
      id: "subscriptions",
      label: "Subscriptions",
      colorSlot: 0,
      iconId: "gift",
      keywords: ["subscriptions"],
      createdAt: "2026-01-01T00:00:00.000Z",
      ...overrides,
    };
  }

  it("returns an empty array when nothing is stored", () => {
    expect(loadCustomCategories()).toEqual([]);
  });

  it("round-trips a valid custom category list", () => {
    const categories = [makeCustomCategory()];
    expect(saveCustomCategories(categories)).toBe(true);
    expect(loadCustomCategories()).toEqual(categories);
  });

  it("accepts a category saved before iconId existed (forward-compat)", () => {
    const withoutIcon: Record<string, unknown> = { ...makeCustomCategory() };
    delete withoutIcon.iconId;
    window.localStorage.setItem("hourglass:custom-categories:v1", JSON.stringify([withoutIcon]));
    expect(loadCustomCategories()).toEqual([withoutIcon]);
  });

  it("drops an entry with an invalid colorSlot", () => {
    window.localStorage.setItem(
      "hourglass:custom-categories:v1",
      JSON.stringify([makeCustomCategory(), { ...makeCustomCategory(), id: "bad", colorSlot: 5 }]),
    );
    expect(loadCustomCategories()).toEqual([makeCustomCategory()]);
  });
});
