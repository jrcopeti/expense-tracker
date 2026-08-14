# Code Review: `components/expenses/CategoryBadge.tsx`

**Reviewed against:** `components/ui/Button.tsx` (components), `lib/expense-utils.ts` (utilities), `hooks/useExpenses.ts` (hooks), plus this project's `"use client"`, Tailwind/`clsx`/semantic-token, `@/*` alias, and `<Component>Props` conventions.

**Overall quality:** Good
**Refactoring effort:** Low

## Summary

`CategoryBadge.tsx` is a small, correct, well-typed presentational component that follows the project's conventions closely — named export, colocated `CategoryBadgeProps` interface, `clsx` for conditional classes, `@/*` imports, and correct omission of `"use client"` since it's pure props-in/JSX-out with no hooks or event handlers (consistent with `components/ui/EmptyState.tsx` and `components/ui/Skeleton.tsx`). No security or correctness issues found. The suggestions below are polish, not defects.

## Findings

### 1. Size variant styling diverges from the `Button.tsx` lookup-map pattern (Low)
**Lines 14, 19, 22, 24**

`size` drives three separate inline ternaries checking the same condition:

```tsx
const isSmall = size === "sm";
...
isSmall ? "h-6 w-6" : "h-8 w-8"       // line 19
isSmall ? "h-3.5 w-3.5" : "h-4 w-4"   // line 22
isSmall ? "text-xs" : "text-sm"       // line 24
```

`Button.tsx` establishes the project's pattern for variant-driven styling: a `Record<Size, string>` (or here, a small object per size) defined once outside the component, e.g.:

```tsx
const SIZE_CLASSES: Record<Size, { wrap: string; icon: string; text: string }> = {
  sm: { wrap: "h-6 w-6", icon: "h-3.5 w-3.5", text: "text-xs" },
  md: { wrap: "h-8 w-8", icon: "h-4 w-4", text: "text-sm" },
};
```

This isn't wrong at 2 states, but it's inconsistent with the sibling exemplar and slightly harder to scan (three separate booleans to hold in your head vs. one lookup). Worth aligning if this component gains a third size or more variance.

### 2. Decorative icon isn't hidden from assistive tech (Low)
**Line 22**

The `<Icon>` is purely decorative — `meta.label` on line 24 already conveys the category to screen readers. Marking the icon (or its wrapping `<span>` at line 18) with `aria-hidden="true"` would avoid redundant announcement. Note: this same gap exists in `EmptyState.tsx`'s icon, so it's a pre-existing pattern across the codebase rather than something introduced here — but it's a genuine, low-effort improvement worth making here regardless.

### 3. Unnamed magic value in the tint opacity (Nit)
**Line 20**

```tsx
style={{ backgroundColor: `color-mix(in srgb, ${meta.cssVar} 16%, transparent)` }}
```

`16%` is a one-off design value with no name or comment. Not a real defect (it's used once, and the intent — "faint tint of the category color" — is fairly legible from context), but if this opacity is meant to be a reusable design constant rather than specific to this badge, consider extracting it (e.g., `const BADGE_TINT = "16%"`) the way `categories.ts` documents its own non-obvious fields with comments.

## What's already right

- Correct reliance on TypeScript exhaustiveness: `CATEGORY_META[category]` can't be `undefined` because `CATEGORY_META` is typed `Record<Category, CategoryMeta>`, so no defensive runtime check is needed — same trust-the-type-system idiom used in `lib/expense-utils.ts`'s `totals.get(category)!`.
- Inline `style` usage (lines 20, 22) is justified, not a styling-convention violation: the color varies per category and can't be expressed as a static Tailwind class, and `meta.cssVar` is exactly the mechanism `lib/categories.ts` defines for this purpose (`var(--cat-food)`, etc.). Values come from a static developer-authored const, not user input, so there's no injection concern.
- No obvious security vulnerabilities.
- No performance concerns — trivial render, no lists, no unnecessary allocation; consistent with other unmemoized small components in `components/ui/`.
- Test coverage: not flagged — this project has no test framework configured yet, so this is informational only per the updated review standards, not a defect.
