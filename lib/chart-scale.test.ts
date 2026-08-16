import { describe, expect, it } from "vitest";
import { barWidthPercents } from "./chart-scale";

describe("barWidthPercents", () => {
  it("scales the largest value to full width", () => {
    expect(barWidthPercents([10, 5, 2])).toEqual([100, 50, 20]);
  });

  it("is scale-invariant: the same ratios produce the same widths at any magnitude", () => {
    // The regression this function exists for. A divisor floored at 1 kept
    // sub-1 values on an absolute scale, so these two rendered differently
    // despite holding an identical 5 : 2.5 : 1 ratio.
    const large = barWidthPercents([10, 5, 2]);
    const small = barWidthPercents([0.4, 0.2, 0.08]);
    expect(small).toEqual(large);
  });

  it("still reaches full width when every value is below 1", () => {
    expect(barWidthPercents([0.4, 0.2])[0]).toBe(100);
  });

  it("falls back to the minimum when every value is zero, without dividing by zero", () => {
    const widths = barWidthPercents([0, 0, 0]);
    expect(widths).toEqual([4, 4, 4]);
    expect(widths.every(Number.isFinite)).toBe(true);
  });

  it("returns an empty array for no values", () => {
    expect(barWidthPercents([])).toEqual([]);
  });

  it("floors small-but-nonzero values at the minimum width", () => {
    expect(barWidthPercents([1000, 1])[1]).toBe(4);
  });

  it("honours a custom minimum", () => {
    expect(barWidthPercents([1000, 1], 10)).toEqual([100, 10]);
  });

  it("keeps a single value at full width", () => {
    expect(barWidthPercents([7])).toEqual([100]);
  });
});
