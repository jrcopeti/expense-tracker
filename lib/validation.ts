import type { ExpenseInput } from "./types";

export interface ExpenseFormValues {
  date: string;
  amount: string;
  category: string;
  description: string;
}

export type FormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

const MAX_AMOUNT = 1_000_000;

export function validateExpense(values: ExpenseFormValues, validCategoryIds: string[]): FormErrors {
  const errors: FormErrors = {};

  if (!values.date) {
    errors.date = "Date is required.";
  } else {
    const entered = new Date(values.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (Number.isNaN(entered.getTime())) {
      errors.date = "Enter a valid date.";
    } else if (entered.getTime() > today.getTime()) {
      errors.date = "Date can't be in the future.";
    }
  }

  const amountNum = Number(values.amount);
  if (!values.amount.trim()) {
    errors.amount = "Amount is required.";
  } else if (Number.isNaN(amountNum)) {
    errors.amount = "Enter a valid number.";
  } else if (amountNum <= 0) {
    errors.amount = "Amount must be greater than $0.";
  } else if (amountNum > MAX_AMOUNT) {
    errors.amount = `Amount must be less than ${MAX_AMOUNT.toLocaleString()}.`;
  }

  if (!values.category) {
    errors.category = "Choose a category.";
  } else if (!validCategoryIds.includes(values.category)) {
    errors.category = "Choose a valid category.";
  }

  if (!values.description.trim()) {
    errors.description = "Add a short description.";
  } else if (values.description.trim().length > 140) {
    errors.description = "Keep it under 140 characters.";
  }

  return errors;
}

export function toExpenseInput(values: ExpenseFormValues): ExpenseInput {
  return {
    date: values.date,
    amount: Math.round(Number(values.amount) * 100) / 100,
    category: values.category as ExpenseInput["category"],
    description: values.description.trim(),
  };
}

export interface SettingsFormValues {
  mode: "wage" | "income";
  hourlyWage: string;
  monthlyIncome: string;
  hoursPerWeek: string;
  dailyBudget: string;
}

export type SettingsFormErrors = Partial<Record<keyof SettingsFormValues, string>>;

export function validateSettings(values: SettingsFormValues): SettingsFormErrors {
  const errors: SettingsFormErrors = {};

  if (values.mode === "wage") {
    const wage = Number(values.hourlyWage);
    if (!values.hourlyWage.trim()) errors.hourlyWage = "Enter your hourly rate.";
    else if (Number.isNaN(wage) || wage <= 0) errors.hourlyWage = "Enter a rate greater than $0.";
  } else {
    const income = Number(values.monthlyIncome);
    const hours = Number(values.hoursPerWeek);
    if (!values.monthlyIncome.trim()) errors.monthlyIncome = "Enter your monthly income.";
    else if (Number.isNaN(income) || income <= 0) errors.monthlyIncome = "Enter an income greater than $0.";
    if (!values.hoursPerWeek.trim()) errors.hoursPerWeek = "Enter hours worked per week.";
    else if (Number.isNaN(hours) || hours <= 0 || hours > 168) errors.hoursPerWeek = "Enter a value between 1 and 168.";
  }

  if (values.dailyBudget.trim()) {
    const budget = Number(values.dailyBudget);
    if (Number.isNaN(budget) || budget < 0) errors.dailyBudget = "Enter a budget of $0 or more.";
  }

  return errors;
}

const MAX_CATEGORY_LABEL_LENGTH = 30;

/** Returns an error message, or null if the label is fine to create as a new category. */
export function validateCategoryLabel(label: string, existingLabels: string[]): string | null {
  const trimmed = label.trim();
  if (!trimmed) return "Enter a category name.";
  if (trimmed.length > MAX_CATEGORY_LABEL_LENGTH) return `Keep it under ${MAX_CATEGORY_LABEL_LENGTH} characters.`;
  if (existingLabels.some((l) => l.toLowerCase() === trimmed.toLowerCase())) {
    return "That category already exists.";
  }
  return null;
}
