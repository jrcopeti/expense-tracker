import { CATEGORIES, type ExpenseInput } from "./types";

export interface ExpenseFormValues {
  date: string;
  amount: string;
  category: string;
  description: string;
}

export type FormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

const MAX_DATE_YEARS_AHEAD = 0; // no future expenses
const MAX_AMOUNT = 1_000_000;

export function validateExpense(values: ExpenseFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.date) {
    errors.date = "Date is required.";
  } else {
    const entered = new Date(values.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (Number.isNaN(entered.getTime())) {
      errors.date = "Enter a valid date.";
    } else if (entered.getTime() > today.getTime() && MAX_DATE_YEARS_AHEAD === 0) {
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
  } else if (!CATEGORIES.includes(values.category as (typeof CATEGORIES)[number])) {
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
