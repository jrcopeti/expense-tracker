import { describe, expect, it } from "vitest";
import {
  CATEGORY_META,
  CUSTOM_CATEGORY_COLOR_VARS,
  FALLBACK_CATEGORY_CSS_VAR,
  isBuiltInCategory,
  resolveCategoryMeta,
} from "./categories";
import { DEFAULT_CATEGORY_ICON_ID } from "./category-icons";
import type { CustomCategory } from "./types";

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

describe("isBuiltInCategory", () => {
  it("recognizes built-in ids", () => {
    expect(isBuiltInCategory("Food")).toBe(true);
    expect(isBuiltInCategory("Bills")).toBe(true);
  });

  it("rejects custom or unknown ids", () => {
    expect(isBuiltInCategory("subscriptions")).toBe(false);
    expect(isBuiltInCategory("")).toBe(false);
  });
});

describe("resolveCategoryMeta", () => {
  it("resolves a built-in id straight from CATEGORY_META", () => {
    expect(resolveCategoryMeta("Food", [])).toBe(CATEGORY_META.Food);
  });

  it("resolves a custom category with an assigned color slot", () => {
    const custom = makeCustomCategory({ colorSlot: 1 });
    const meta = resolveCategoryMeta("subscriptions", [custom]);
    expect(meta.label).toBe("Subscriptions");
    expect(meta.cssVar).toBe(CUSTOM_CATEGORY_COLOR_VARS[1]);
  });

  it("falls back to the neutral color for a custom category with no slot left", () => {
    const custom = makeCustomCategory({ colorSlot: null });
    const meta = resolveCategoryMeta("subscriptions", [custom]);
    expect(meta.cssVar).toBe(FALLBACK_CATEGORY_CSS_VAR);
  });

  it("falls back to the default icon for an unrecognized iconId", () => {
    const custom = makeCustomCategory({ iconId: "not-a-real-icon" });
    const meta = resolveCategoryMeta("subscriptions", [custom]);
    expect(meta.icon).toBe(resolveCategoryMeta("subscriptions", [makeCustomCategory({ iconId: DEFAULT_CATEGORY_ICON_ID })]).icon);
  });

  it("resolves gracefully when the id matches neither a built-in nor any custom category (deleted category)", () => {
    const meta = resolveCategoryMeta("deleted-category-id", []);
    expect(meta.label).toBe("deleted-category-id");
    expect(meta.cssVar).toBe(FALLBACK_CATEGORY_CSS_VAR);
    expect(meta.keywords).toEqual([]);
  });
});
