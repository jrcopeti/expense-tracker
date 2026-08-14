import type { Settings } from "./types";

const WEEKS_PER_MONTH = 4.345; // 52 / 12, the standard payroll conversion

/** Derives an hourly wage from monthly income, if a direct wage wasn't given. */
export function effectiveHourlyWage(settings: Settings): number | null {
  if (settings.hourlyWage && settings.hourlyWage > 0) return settings.hourlyWage;
  if (settings.monthlyIncome && settings.monthlyIncome > 0 && settings.hoursPerWeek > 0) {
    return settings.monthlyIncome / (settings.hoursPerWeek * WEEKS_PER_MONTH);
  }
  return null;
}

/** Dollars -> hours of work, or null if no wage is configured yet. */
export function amountToHours(amount: number, settings: Settings): number | null {
  const wage = effectiveHourlyWage(settings);
  if (!wage) return null;
  return amount / wage;
}

/**
 * "2h 15m", "45m", "6d 3h" for very large spends, or "<1m" for near-zero.
 * Caps at days (never rolls into weeks/months - the point is visceral, not precise).
 */
export function formatHours(hours: number): string {
  const totalMinutes = Math.round(hours * 60);
  if (totalMinutes < 1) return "<1m";

  const days = Math.floor(totalMinutes / (60 * 24));
  const remAfterDays = totalMinutes % (60 * 24);
  const hrs = Math.floor(remAfterDays / 60);
  const mins = remAfterDays % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hrs > 0) parts.push(`${hrs}h`);
  if (mins > 0 && days === 0) parts.push(`${mins}m`);
  return parts.join(" ") || "<1m";
}

/** Amount -> "2h 15m of your life", or a dollar-only fallback if unconfigured. */
export function formatTimeCost(amount: number, settings: Settings): string {
  const hours = amountToHours(amount, settings);
  if (hours === null) return "—";
  return formatHours(hours);
}
