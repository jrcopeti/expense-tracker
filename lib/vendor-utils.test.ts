import { describe, expect, it } from "vitest";
import { NO_VENDOR_LABEL, topVendors, vendorFromDescription, vendorKey } from "./vendor-utils";
import type { Expense } from "./types";

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: overrides.id ?? Math.random().toString(36),
    date: "2026-08-01",
    amount: 10,
    category: "Food",
    description: "",
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("vendorFromDescription", () => {
  it("takes the phrase after the first 'at' connector", () => {
    expect(vendorFromDescription("Grocery run at Trader Joe's")).toBe("Trader Joe's");
  });

  it("takes the phrase after the first 'from' connector", () => {
    expect(vendorFromDescription("Bought from Amazon")).toBe("Amazon");
  });

  it("uses the FIRST connector, not the last, when both appear", () => {
    expect(vendorFromDescription("Groceries at Trader Joe's from mom's list")).toBe("Trader Joe's");
  });

  it("returns the whole cleaned description when there's no connector", () => {
    expect(vendorFromDescription("Netflix subscription")).toBe("Netflix subscription");
  });

  it("collapses whitespace and trims edge punctuation", () => {
    expect(vendorFromDescription("  Coffee,   lots of   spaces!!  ")).toBe("Coffee, lots of spaces");
  });

  it("preserves non-Latin text instead of stripping it", () => {
    expect(vendorFromDescription("コンビニ")).toBe("コンビニ");
  });

  it("falls back to NO_VENDOR_LABEL for a blank description", () => {
    expect(vendorFromDescription("")).toBe(NO_VENDOR_LABEL);
    expect(vendorFromDescription("   ")).toBe(NO_VENDOR_LABEL);
  });

  it("falls back to the whole cleaned description when the extracted phrase is empty", () => {
    // Nothing meaningful follows "at" once edge punctuation is stripped.
    expect(vendorFromDescription("Dinner at !!!")).toBe("Dinner at");
  });
});

describe("vendorKey", () => {
  it("lowercases for case-insensitive grouping", () => {
    expect(vendorKey("Trader Joe's")).toBe(vendorKey("trader joe's"));
  });
});

describe("topVendors", () => {
  it("groups expenses by vendor and sums totals", () => {
    const result = topVendors([
      makeExpense({ description: "Coffee at Starbucks", amount: 5 }),
      makeExpense({ description: "coffee at starbucks", amount: 6 }), // different casing, same key
      makeExpense({ description: "Gas at Shell", amount: 40 }),
    ]);

    expect(result[0]).toMatchObject({ vendor: "Shell", total: 40, count: 1 });
    expect(result[1]).toMatchObject({ vendor: "Starbucks", total: 11, count: 2 });
  });

  it("sorts descending by total, then alphabetically for ties", () => {
    const result = topVendors([
      makeExpense({ description: "at Zebra", amount: 10 }),
      makeExpense({ description: "at Alpha", amount: 10 }),
    ]);
    expect(result.map((v) => v.vendor)).toEqual(["Alpha", "Zebra"]);
  });

  it("picks the most common casing as the display label, ties go to first seen", () => {
    const result = topVendors([
      makeExpense({ description: "at amazon", amount: 1 }),
      makeExpense({ description: "at Amazon", amount: 1 }),
      makeExpense({ description: "at Amazon", amount: 1 }),
    ]);
    expect(result[0].vendor).toBe("Amazon");
  });

  it("tracks the most recent date per vendor", () => {
    const result = topVendors([
      makeExpense({ description: "at Shell", date: "2026-08-01", amount: 10 }),
      makeExpense({ description: "at Shell", date: "2026-08-10", amount: 10 }),
      makeExpense({ description: "at Shell", date: "2026-08-05", amount: 10 }),
    ]);
    expect(result[0].lastDate).toBe("2026-08-10");
  });

  it("buckets blank descriptions under NO_VENDOR_LABEL so totals still sum to 100%", () => {
    const result = topVendors([makeExpense({ description: "", amount: 20 }), makeExpense({ description: "  ", amount: 30 })]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ vendor: NO_VENDOR_LABEL, total: 50, percent: 100 });
  });

  it("returns an empty array for no expenses", () => {
    expect(topVendors([])).toEqual([]);
  });
});
