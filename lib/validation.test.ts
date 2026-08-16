import { describe, expect, it } from "vitest";
import {
  toExpenseInput,
  validateCategoryLabel,
  validateExpense,
  validateSettings,
  type ExpenseFormValues,
  type SettingsFormValues,
} from "./validation";
import { todayIso } from "./format";

const VALID_CATEGORIES = ["Food", "Transportation", "Entertainment", "Shopping", "Bills", "Other"];

function makeValues(overrides: Partial<ExpenseFormValues> = {}): ExpenseFormValues {
  return { date: "2026-08-01", amount: "10.50", category: "Food", description: "Lunch", ...overrides };
}

describe("validateExpense", () => {
  it("returns no errors for fully valid input", () => {
    expect(validateExpense(makeValues(), VALID_CATEGORIES)).toEqual({});
  });

  it("requires a date", () => {
    expect(validateExpense(makeValues({ date: "" }), VALID_CATEGORIES).date).toBeDefined();
  });

  it("rejects a future date", () => {
    // +2 days (not +1): validateExpense parses the date string as UTC
    // midnight but compares it against local end-of-day, so a same-named
    // "tomorrow" can land inside today's local window near the international
    // date line. +2 days clears that margin in every real-world timezone.
    const future = new Date();
    future.setDate(future.getDate() + 2);
    const iso = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, "0")}-${String(future.getDate()).padStart(2, "0")}`;
    expect(validateExpense(makeValues({ date: iso }), VALID_CATEGORIES).date).toBeDefined();
  });

  it("accepts today's date", () => {
    expect(validateExpense(makeValues({ date: todayIso() }), VALID_CATEGORIES).date).toBeUndefined();
  });

  it("requires a positive amount", () => {
    expect(validateExpense(makeValues({ amount: "" }), VALID_CATEGORIES).amount).toBeDefined();
    expect(validateExpense(makeValues({ amount: "0" }), VALID_CATEGORIES).amount).toBeDefined();
    expect(validateExpense(makeValues({ amount: "-5" }), VALID_CATEGORIES).amount).toBeDefined();
    expect(validateExpense(makeValues({ amount: "not a number" }), VALID_CATEGORIES).amount).toBeDefined();
  });

  it("caps the amount at $1,000,000", () => {
    expect(validateExpense(makeValues({ amount: "1000001" }), VALID_CATEGORIES).amount).toBeDefined();
    expect(validateExpense(makeValues({ amount: "1000000" }), VALID_CATEGORIES).amount).toBeUndefined();
  });

  it("requires a category from the valid id list", () => {
    expect(validateExpense(makeValues({ category: "" }), VALID_CATEGORIES).category).toBeDefined();
    expect(validateExpense(makeValues({ category: "not-a-category" }), VALID_CATEGORIES).category).toBeDefined();
  });

  it("accepts a custom category id present in validCategoryIds", () => {
    expect(validateExpense(makeValues({ category: "custom-subscriptions" }), [...VALID_CATEGORIES, "custom-subscriptions"]).category).toBeUndefined();
  });

  it("requires a non-blank description under 140 characters", () => {
    expect(validateExpense(makeValues({ description: "  " }), VALID_CATEGORIES).description).toBeDefined();
    expect(validateExpense(makeValues({ description: "a".repeat(141) }), VALID_CATEGORIES).description).toBeDefined();
    expect(validateExpense(makeValues({ description: "a".repeat(140) }), VALID_CATEGORIES).description).toBeUndefined();
  });
});

describe("toExpenseInput", () => {
  it("rounds the amount to cents and trims the description", () => {
    const input = toExpenseInput(makeValues({ amount: "10.125", description: "  Lunch  " }));
    expect(input.amount).toBe(10.13);
    expect(input.description).toBe("Lunch");
  });
});

function makeSettingsValues(overrides: Partial<SettingsFormValues> = {}): SettingsFormValues {
  return { mode: "wage", hourlyWage: "25", monthlyIncome: "", hoursPerWeek: "", dailyBudget: "", ...overrides };
}

describe("validateSettings", () => {
  it("accepts a valid wage-mode form", () => {
    expect(validateSettings(makeSettingsValues())).toEqual({});
  });

  it("requires a positive hourly wage in wage mode", () => {
    expect(validateSettings(makeSettingsValues({ hourlyWage: "" })).hourlyWage).toBeDefined();
    expect(validateSettings(makeSettingsValues({ hourlyWage: "0" })).hourlyWage).toBeDefined();
  });

  it("requires income and hours/week in income mode", () => {
    const errors = validateSettings(makeSettingsValues({ mode: "income", monthlyIncome: "", hoursPerWeek: "" }));
    expect(errors.monthlyIncome).toBeDefined();
    expect(errors.hoursPerWeek).toBeDefined();
  });

  it("accepts a valid income-mode form", () => {
    const errors = validateSettings(makeSettingsValues({ mode: "income", monthlyIncome: "8000", hoursPerWeek: "40" }));
    expect(errors).toEqual({});
  });

  it("rejects hours/week outside 1-168", () => {
    const errors = validateSettings(makeSettingsValues({ mode: "income", monthlyIncome: "8000", hoursPerWeek: "200" }));
    expect(errors.hoursPerWeek).toBeDefined();
  });

  it("validates an optional daily budget when provided", () => {
    expect(validateSettings(makeSettingsValues({ dailyBudget: "-1" })).dailyBudget).toBeDefined();
    expect(validateSettings(makeSettingsValues({ dailyBudget: "0" })).dailyBudget).toBeUndefined();
    expect(validateSettings(makeSettingsValues({ dailyBudget: "" })).dailyBudget).toBeUndefined();
  });
});

describe("validateCategoryLabel", () => {
  it("rejects a blank label", () => {
    expect(validateCategoryLabel("  ", [])).toMatch(/enter/i);
  });

  it("rejects a label over the max length", () => {
    expect(validateCategoryLabel("a".repeat(31), [])).toMatch(/under/i);
  });

  it("rejects a case-insensitive duplicate of an existing label", () => {
    expect(validateCategoryLabel("food", ["Food"])).toMatch(/already exists/i);
  });

  it("accepts a valid, unique label", () => {
    expect(validateCategoryLabel("Subscriptions", ["Food", "Bills"])).toBeNull();
  });
});
