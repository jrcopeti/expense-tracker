import { describe, expect, it } from "vitest";
import { amountToHours, effectiveHourlyWage, formatHours, formatTimeCost } from "./time-cost";
import { DEFAULT_SETTINGS, type Settings } from "./types";

describe("effectiveHourlyWage", () => {
  it("prefers a direct hourly wage when set", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: 25, monthlyIncome: 10000, hoursPerWeek: 40 };
    expect(effectiveHourlyWage(settings)).toBe(25);
  });

  it("derives a wage from monthly income and hours/week when no direct wage is set", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: null, monthlyIncome: 8690, hoursPerWeek: 40 };
    // 8690 / (40 * 4.345) = 50
    expect(effectiveHourlyWage(settings)).toBeCloseTo(50, 5);
  });

  it("returns null when nothing is configured", () => {
    expect(effectiveHourlyWage(DEFAULT_SETTINGS)).toBeNull();
  });

  it("ignores a zero or negative hourly wage and falls back to income", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: 0, monthlyIncome: 8690, hoursPerWeek: 40 };
    expect(effectiveHourlyWage(settings)).toBeCloseTo(50, 5);
  });

  it("returns null when hoursPerWeek is zero, even with income set", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: null, monthlyIncome: 8690, hoursPerWeek: 0 };
    expect(effectiveHourlyWage(settings)).toBeNull();
  });
});

describe("amountToHours", () => {
  it("converts a dollar amount to hours at the effective wage", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: 20 };
    expect(amountToHours(100, settings)).toBe(5);
  });

  it("returns null when no wage is configured", () => {
    expect(amountToHours(100, DEFAULT_SETTINGS)).toBeNull();
  });
});

describe("formatHours", () => {
  it("formats sub-minute spends as <1m", () => {
    expect(formatHours(0)).toBe("<1m");
    expect(formatHours(1 / 600)).toBe("<1m"); // 6 seconds, rounds to 0 minutes
  });

  it("formats minutes only", () => {
    expect(formatHours(0.75)).toBe("45m");
  });

  it("formats hours and minutes", () => {
    expect(formatHours(2.25)).toBe("2h 15m");
  });

  it("drops the minutes component when it's exactly on the hour", () => {
    expect(formatHours(3)).toBe("3h");
  });

  it("caps at days and omits minutes once days are involved", () => {
    // 6 days 3 hours 30 minutes -> minutes are dropped once days > 0.
    const hours = 6 * 24 + 3 + 0.5;
    expect(formatHours(hours)).toBe("6d 3h");
  });

  it("shows days alone when hours and minutes are both zero", () => {
    expect(formatHours(24)).toBe("1d");
  });
});

describe("formatTimeCost", () => {
  it("returns an em dash when no wage is configured", () => {
    expect(formatTimeCost(100, DEFAULT_SETTINGS)).toBe("—");
  });

  it("formats the time cost when a wage is configured", () => {
    const settings: Settings = { ...DEFAULT_SETTINGS, hourlyWage: 20 };
    expect(formatTimeCost(50, settings)).toBe("2h 30m");
  });
});
