import { CATEGORIES, type Category } from "./types";
import { CATEGORY_META } from "./categories";
import { isoDaysAgo, todayIso } from "./format";

export interface ParsedExpense {
  amount: number;
  category: Category;
  matchedKeyword: string | null;
  date: string;
  description: string;
}

const AMOUNT_PATTERN = /\$?\s?(\d+(?:\.\d{1,2})?)/g;
const DAY_KEYWORDS: Array<[pattern: RegExp, resolve: () => string]> = [
  [/\byesterday\b/i, () => isoDaysAgo(1)],
  [/\btoday\b/i, () => todayIso()],
];

/**
 * Turns one free-typed line ("14.50 lunch with sara", "coffee 4.75",
 * "yesterday 40 gas") into a best-guess expense. Returns null only when no
 * amount could be found at all - everything else always resolves to
 * *something* (category defaults to "Other", date defaults to today) so the
 * result is always safe to hand to the edit form for a one-click fix.
 */
export function parseExpenseInput(raw: string): ParsedExpense | null {
  const input = raw.trim();
  if (!input) return null;

  // 1. Amount: prefer the first decimal-looking number (reads as a price);
  // otherwise fall back to the largest bare integer in the line.
  const matches = [...input.matchAll(AMOUNT_PATTERN)];
  if (matches.length === 0) return null;

  const decimalMatch = matches.find((m) => m[1].includes("."));
  const chosen = decimalMatch ?? matches.reduce((max, m) => (Number(m[1]) > Number(max[1]) ? m : max));
  const amount = Math.round(Number(chosen[1]) * 100) / 100;
  if (!(amount > 0)) return null;

  // Strip the matched amount token out by index (from the *original* string,
  // before any other rewriting, so the index stays valid).
  const amountIndex = chosen.index ?? 0;
  let withoutAmount = input.slice(0, amountIndex) + input.slice(amountIndex + chosen[0].length);

  // 2. Date keyword - resolved from the original input, then stripped from
  // the (already amount-free) remainder via a fresh regex pass.
  let date = todayIso();
  for (const [pattern, resolve] of DAY_KEYWORDS) {
    if (pattern.test(input)) {
      date = resolve();
      withoutAmount = withoutAmount.replace(pattern, "");
      break;
    }
  }

  // 3. Category: longest matching keyword wins (so "water bill" beats a
  // shorter accidental collision).
  const lower = withoutAmount.toLowerCase();
  let category: Category = "Other";
  let matchedKeyword: string | null = null;
  for (const cat of CATEGORIES) {
    for (const keyword of CATEGORY_META[cat].keywords) {
      if (lower.includes(keyword) && (!matchedKeyword || keyword.length > matchedKeyword.length)) {
        category = cat;
        matchedKeyword = keyword;
      }
    }
  }

  // 4. Description: whatever's left, cleaned up.
  const description = withoutAmount.replace(/\s{2,}/g, " ").trim() || category;

  return {
    amount,
    category,
    matchedKeyword,
    date,
    description: capitalize(description),
  };
}

function capitalize(s: string): string {
  return s.length ? s[0].toUpperCase() + s.slice(1) : s;
}
