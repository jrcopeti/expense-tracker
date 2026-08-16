# Code Review: `components/dashboard/CategoryTimeChart.tsx`

**Reviewed against:** `components/ui/Button.tsx` (components), `lib/expense-utils.ts` (utilities), `hooks/useExpenses.ts` / `hooks/useCategories.ts` (hooks), plus this project's `"use client"`, Tailwind/`clsx`/semantic-token, `@/*` alias, and `<Component>Props` conventions.

**Overall quality:** Good
**Refactoring effort:** Low

## Summary

A compact, well-typed bar chart that follows the project's structural conventions closely — named export, colocated `CategoryTimeChartProps`, `@/*` imports throughout, correct `"use client"` (it calls `useCategories`), and correct delegation of the dollars→hours reframe to `lib/time-cost.ts` rather than reimplementing the math.

One real rendering defect: the bar scale silently flips from relative to absolute whenever every category's value falls below `1`, which makes the chart under-report at small spend levels. Everything else below is polish.

## Findings

### 1. Bars mis-scale when all values are under 1 (Medium) — correctness

**Line 21**

```tsx
const maxValue = Math.max(1, ...rows.map((r) => (configured ? r.hours ?? 0 : r.total)));
```

The literal `1` is a divide-by-zero guard, but it is not floored to zero — it competes with the real data. Once every value is below `1`, `maxValue` stops tracking the largest row and pins to `1`, so the chart quietly stops being relative and becomes an absolute "fraction of one hour" scale. The longest bar no longer reaches full width.

Verified with a wage of $50/h across two datasets holding the **same 5 : 2.5 : 1 ratio**:

| Spend | Hours | Rendered width |
| --- | --- | --- |
| $500 / $250 / $100 | 10.0 / 5.0 / 2.0 | 100% / 50% / 20% |
| $20 / $10 / $4 | 0.40 / 0.20 / 0.08 | **40% / 20% / 8%** |

The second chart should look identical to the first. This is reachable in normal use: at $50/h any category under $50 total is below one hour, so a new user's first few days of expenses render as a set of stubs. The `Math.max(4, …)` floor on line 38 partly masks it by keeping short bars visible, which makes the bug easy to miss visually.

Fix — apply the guard only when there is genuinely nothing to scale against:

```tsx
const values = rows.map((r) => (configured ? r.hours ?? 0 : r.total));
const peak = Math.max(...values);
// Only guard the all-zero case; flooring at 1 would silently rescale
// every bar whenever the largest value is under an hour.
const maxValue = peak > 0 ? peak : 1;
```

The unconfigured branch has the same latent issue in dollars, though it bites far less often since totals below $1 are rare.

### 2. `?? 0` is dead defensive code the types don't need (Low)

**Lines 21, 37, 50**

`row.hours` is `null` under exactly the condition that makes `configured` false — both come from `effectiveHourlyWage(settings)` via the same `settings` object, so they can never disagree:

```tsx
const configured = amountToHours(1, settings) !== null;   // line 19
hours: amountToHours(d.total, settings)                    // line 20
```

Every `?? 0` sits behind a `configured ?` guard, so none of the three can ever fire. `CLAUDE.md` prefers "typed exhaustiveness over defensive runtime checks where the type system already guarantees safety" (the `CATEGORY_META[category]` idiom). Modelling the invariant once removes all three:

```tsx
const wage = effectiveHourlyWage(settings);
const rows = data.map((d) => ({ ...d, hours: wage === null ? null : d.total / wage }));
```

…or narrow to two explicit shapes so `hours: number` is guaranteed in the configured branch.

### 3. `configured` derives a boolean through a dummy conversion (Low)

**Line 19**

```tsx
const configured = amountToHours(1, settings) !== null;
```

`lib/time-cost.ts` exports `effectiveHourlyWage(settings)` for precisely this question. Converting a magic `$1` and testing the result for `null` is an indirect way to ask "is a wage configured?", and the `1` reads as significant when it isn't. `effectiveHourlyWage(settings) !== null` says the same thing directly, and pairs naturally with finding #2 since you need the wage anyway.

### 4. The dollar amount is mouse-only (Low) — accessibility

**Lines 43–46**

```tsx
title={`${meta.label}: ${formatCurrency(row.total)}${…}`}
```

When a wage is configured the row's visible text shows **hours** (line 50), so the dollar total exists only inside `title` on a non-interactive `<div>`. `title` isn't reachable by keyboard, is unreliably announced by screen readers, and never appears on touch — so that figure is unavailable to anyone not hovering with a mouse.

Since both numbers are already computed, the least invasive fix is to expose the pair as text on the row (a muted secondary span), or add `aria-label` to the `<li>` carrying label, hours, and dollars. Worth confirming against how the sibling dashboard cards present the same dual figure, so the treatment stays consistent.

### 5. `h-5` is duplicated across wrapper and bar (Nit)

**Lines 44, 47**

The track (`relative h-5 flex-1 min-w-0`) and the fill (`h-5 rounded-r`) hardcode the same height independently; changing the bar thickness means editing both. The fill can use `absolute inset-y-0 left-0` instead, letting the track own the height.

Also worth a look: `rounded-r` rounds only the trailing edge, so a bar at the `Math.max(4, …)` minimum renders as a 4%-wide sliver with one square end and one round one.

## What's already right

- **`"use client"` is correctly present** (line 1) — the component calls `useCategories()`, which is a `useSyncExternalStore` hook. Not the reflexive copy-paste the convention warns about.
- **Inline `style` for the bar color is the sanctioned mechanism, not a styling violation.** `meta.cssVar` resolves to `var(--cat-food)` etc. from `lib/categories.ts`; the color varies per category and can't be a static Tailwind class. All other colors correctly use semantic tokens (`text-foreground`, `text-secondary`, `text-muted`). No hardcoded hex anywhere.
- **The domain reframe is delegated, not duplicated** — `amountToHours` / `formatHours` come from `lib/time-cost.ts`, exactly as `CLAUDE.md` requires.
- **Custom categories resolve correctly** via `metaOf` (line 39) rather than indexing `CATEGORY_META` directly, so a user-created category renders with its real label and color.
- **Sort order is safe.** `data` arrives pre-sorted by `total` desc from `totalsByCategory`, and hours are a single-wage monotonic transform of dollars, so the hours view never needs re-sorting. The component does depend on that ordering without stating it — a one-line comment noting "expects data sorted desc" would protect it from a future caller.
- **No security concerns.** No user-controlled HTML, no `dangerouslySetInnerHTML`; `meta.cssVar` comes from developer-authored constants or a fixed slot table, never free text.
- **Performance is a non-issue at this scale.** `rows`/`maxValue` are recomputed each render without `useMemo`, but the array is bounded by category count (single digits). Consistent with other small unmemoized components; not worth changing.
- **The empty state is genuinely reachable** — `totalsByCategory` filters to `count > 0`, so `rows.length === 0` is a real case and is handled (lines 30–33).

## Test coverage

There is no `components/dashboard/CategoryTimeChart.test.tsx`. This is pre-existing code, and `CLAUDE.md`'s testing policy is explicitly forward-looking — it doesn't require backfilling untested code, only covering what you touch. So this is **not** scored as a defect here.

That said, if finding #1 is fixed, that fix is a change and should ship with a test. The bar-width math is pure and easy to cover once extracted:

- identical ratios produce identical widths regardless of absolute magnitude (the #1 regression)
- an all-zero `data` array doesn't produce `NaN` or `Infinity` widths
- the unconfigured branch scales on dollars and renders currency
- every bar stays at or above the 4% minimum
