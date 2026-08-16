/** Smallest bar width, so a tiny-but-nonzero value still renders as something. */
const MIN_BAR_PERCENT = 4;

/**
 * Bar widths as percentages of the largest value in the set.
 *
 * Only the all-zero case gets a synthetic maximum. Flooring the divisor at 1
 * instead — `Math.max(1, ...values)` — reads as an equivalent divide-by-zero
 * guard but silently rescales every bar whenever the largest value is below 1,
 * turning a relative chart into an absolute one. That is routine here, not a
 * corner case: at $50/h any category under $50 is less than an hour of work.
 */
export function barWidthPercents(values: number[], minPercent: number = MIN_BAR_PERCENT): number[] {
  const peak = Math.max(0, ...values);
  if (peak === 0) return values.map(() => minPercent);
  return values.map((value) => Math.max(minPercent, (value / peak) * 100));
}
