import type { Expense } from "./types";
import { sumAmount } from "./expense-utils";

/**
 * Expenses have no vendor field - `description` is free text (typed into the
 * form, or whatever `lib/parse-expense.ts` left after stripping the amount and
 * date keywords). A blank description therefore isn't a data error, it's a
 * normal outcome, and its spending is real money. Bucketing those rows under an
 * explicit label keeps the vendor percentages summing to 100% of total spend;
 * dropping them would quietly under-report the total instead.
 */
export const NO_VENDOR_LABEL = "No description";

/**
 * Leading/trailing noise to shave off a description. Listed explicitly rather
 * than as "everything that isn't [A-Za-z0-9]" so a non-Latin vendor name
 * survives intact (and so \p{L}, which needs an ES2018 target, isn't needed).
 */
const EDGE_NOISE = /^[\s\-–—_:;,.!?/\\|"'“”‘’()[\]{}*+=&#@$]+|[\s\-–—_:;,.!?/\\|"'“”‘’()[\]{}*+=&#@$]+$/g;

/**
 * "at" / "from" are the two English words that introduce a merchant
 * ("grocery run at Trader Joe's", "bought from Amazon"). The *first* one wins:
 * in "groceries at Trader Joe's from mom's list" the merchant is the phrase
 * right after the first connector, not the last. This is deliberately the only
 * piece of cleverness here - no fuzzy matching, no clustering - so a
 * description like "dinner at 8" will group under "8". That's an accepted
 * miss; the alternative is guessing, and a wrong guess is harder to explain
 * than a literal one.
 */
const VENDOR_CONNECTOR = /(?:^|\s)(?:at|from)\s/i;

/**
 * A description reduced to its display-form vendor: whitespace collapsed, edge
 * punctuation trimmed, and the merchant phrase pulled out if the text names one
 * with "at"/"from". Original casing is preserved - `vendorKey` handles grouping.
 */
export function vendorFromDescription(description: string): string {
  const cleaned = description.replace(/\s+/g, " ").replace(EDGE_NOISE, "");
  if (!cleaned) return NO_VENDOR_LABEL;

  const parts = cleaned.split(VENDOR_CONNECTOR);
  const candidate = (parts.length > 1 ? parts[1] : parts[0]).replace(EDGE_NOISE, "");
  return candidate || cleaned;
}

/** Case-folded grouping key, so "Trader Joe's" and "trader joe's" are one vendor. */
export function vendorKey(vendor: string): string {
  return vendor.toLowerCase();
}

export interface VendorTotal {
  vendor: string;
  total: number;
  count: number;
  percent: number;
  /** ISO yyyy-mm-dd of the most recent expense attributed to this vendor. */
  lastDate: string;
}

export function topVendors(expenses: Expense[]): VendorTotal[] {
  const grandTotal = sumAmount(expenses);
  const totals = new Map<
    string,
    { total: number; count: number; lastDate: string; labels: Map<string, number> }
  >();

  for (const e of expenses) {
    const label = vendorFromDescription(e.description);
    const key = vendorKey(label);
    const entry = totals.get(key) ?? { total: 0, count: 0, lastDate: e.date, labels: new Map() };
    entry.total += e.amount;
    entry.count += 1;
    if (e.date > entry.lastDate) entry.lastDate = e.date;
    entry.labels.set(label, (entry.labels.get(label) ?? 0) + 1);
    totals.set(key, entry);
  }

  return Array.from(totals.values())
    .map((entry) => ({
      vendor: mostCommonLabel(entry.labels),
      total: entry.total,
      count: entry.count,
      percent: grandTotal > 0 ? (entry.total / grandTotal) * 100 : 0,
      lastDate: entry.lastDate,
    }))
    .sort((a, b) => b.total - a.total || a.vendor.localeCompare(b.vendor));
}

/** The casing the user wrote most often; ties go to the first one seen. */
function mostCommonLabel(labels: Map<string, number>): string {
  let best = NO_VENDOR_LABEL;
  let bestCount = 0;
  for (const [label, count] of labels) {
    if (count > bestCount) {
      best = label;
      bestCount = count;
    }
  }
  return best;
}
