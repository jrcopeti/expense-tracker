import { describe, expect, it } from "vitest";
import { parseExpenseInput } from "./parse-expense";
import { todayIso, isoDaysAgo } from "./format";
import type { CustomCategory } from "./types";

describe("parseExpenseInput", () => {
  it("returns null when there's no amount to find", () => {
    expect(parseExpenseInput("just some text")).toBeNull();
    expect(parseExpenseInput("")).toBeNull();
    expect(parseExpenseInput("   ")).toBeNull();
  });

  it("parses a decimal amount and defaults date to today and category to Other", () => {
    const result = parseExpenseInput("14.50 lunch with sara");
    expect(result).toMatchObject({ amount: 14.5, date: todayIso(), category: "Food" });
  });

  it("prefers a decimal-looking amount over a larger bare integer", () => {
    // "4.75" reads as the price; "2" is incidental (e.g. quantity), not the amount.
    const result = parseExpenseInput("coffee 4.75 x2");
    expect(result?.amount).toBe(4.75);
  });

  it("falls back to the largest bare integer when nothing is decimal", () => {
    const result = parseExpenseInput("40 gas");
    expect(result?.amount).toBe(40);
  });

  it("resolves the 'yesterday' keyword and strips it from the description", () => {
    const result = parseExpenseInput("yesterday 40 gas");
    expect(result?.date).toBe(isoDaysAgo(1));
    expect(result?.description.toLowerCase()).not.toContain("yesterday");
  });

  it("resolves the 'today' keyword explicitly", () => {
    const result = parseExpenseInput("today 12 coffee");
    expect(result?.date).toBe(todayIso());
  });

  it("matches a built-in category keyword, longest match wins", () => {
    // "water bill" (10 chars) should beat a shorter accidental collision.
    const result = parseExpenseInput("45 water bill");
    expect(result?.category).toBe("Bills");
    expect(result?.matchedKeyword).toBe("water bill");
  });

  it("defaults to Other with no matched keyword when nothing matches", () => {
    const result = parseExpenseInput("99 xyzzy plugh");
    expect(result?.category).toBe("Other");
    expect(result?.matchedKeyword).toBeNull();
  });

  it("matches a custom category's auto-generated keyword", () => {
    const customCategories: CustomCategory[] = [
      { id: "subscriptions", label: "Subscriptions", colorSlot: 0, iconId: "tag", keywords: ["subscriptions"], createdAt: "2026-01-01T00:00:00.000Z" },
    ];
    const result = parseExpenseInput("15 subscriptions renewal", customCategories);
    expect(result?.category).toBe("subscriptions");
    expect(result?.matchedKeyword).toBe("subscriptions");
  });

  it("uses whatever text remains, capitalized, as the description", () => {
    const result = parseExpenseInput("5 coffee");
    expect(result?.description).toBe("Coffee");
  });

  it("falls back to the category name as description when nothing else is left", () => {
    // Amount-only input: nothing remains after stripping the amount, so the
    // description falls back to the (default, unmatched) category name.
    const result = parseExpenseInput("40");
    expect(result?.category).toBe("Other");
    expect(result?.description).toBe("Other");
  });

  it("returns null for a zero or negative amount", () => {
    expect(parseExpenseInput("0 free sample")).toBeNull();
  });
});
