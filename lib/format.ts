const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Auto-compact for large hero/stat values: 1,284 -> $1.3K, 4,200,000 -> $4.2M */
export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) < 1000) return formatCurrency(amount);
  return compactCurrencyFormatter.format(amount);
}

export function formatDate(isoDate: string): string {
  // isoDate is "yyyy-mm-dd"; parse as local date to avoid TZ off-by-one.
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonthLabel(isoMonth: string): string {
  // isoMonth is "yyyy-mm"
  const [year, month] = isoMonth.split("-").map(Number);
  const date = new Date(year, (month ?? 1) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function todayIso(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthKey(isoDate: string): string {
  // "yyyy-mm-dd" -> "yyyy-mm"
  return isoDate.slice(0, 7);
}
