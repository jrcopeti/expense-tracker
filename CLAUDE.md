@AGENTS.md

# Hourglass — Project Guide

Expense tracker that reframes every dollar as **hours of your life** spent
earning it, instead of leading with a dollar total. Client-only: all data
lives in the browser's `localStorage`, there's no backend, account, or API.
See `README.md` for the product pitch and manual test script — this file is
about how the code is built, not what it does for a user.

## Tech stack

- Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (`strict`)
- Tailwind CSS v4 (via `@tailwindcss/postcss`, no `tailwind.config.*`) + `clsx`
- `lucide-react` icons, `react-hot-toast` for feedback
- Vitest (`jsdom` environment) + `@testing-library/react` for tests. See
  **Testing** below for the policy and conventions.

## Architecture

- **No server, no Context.** State lives in two tiny vanilla stores —
  `lib/expenseStore.ts` and `lib/settingsStore.ts` — each a module-level
  cache + `Set<Listener>`, read via `useSyncExternalStore` in
  `hooks/useExpenses.ts` / `hooks/useSettings.ts`. This avoids the extra
  render a `useEffect`+`setState` mirror would cost and satisfies
  `react-hooks/set-state-in-effect`. If you add another piece of shared
  client state, follow this pattern rather than reaching for Context.
- **Persistence** is isolated in `lib/storage.ts`, which wraps every
  `localStorage` call in `try/catch` and returns a `boolean` success flag
  (private-browsing/quota failures are real and silent otherwise). The hooks
  turn a `false` return into a toast (see `PERSIST_WARNING` in
  `hooks/useExpenses.ts` / `hooks/useSettings.ts`) — reuse that pattern for
  any new mutation instead of letting a failed write pass silently.
  `storage.ts` also guards every read with `typeof window === "undefined"`
  and validates shape (`isValidExpense`) before trusting parsed JSON.
- **Hydration** uses `hooks/useIsClient.ts` (`useSyncExternalStore`, server
  snapshot `false` / client snapshot `true`) instead of a mount-flag
  `useEffect`, for the same render-count and lint reasons as above.
- **The core domain reframe** — dollars → hours — lives entirely in
  `lib/time-cost.ts` (`effectiveHourlyWage`, `amountToHours`, `formatHours`).
  Any feature that displays a dollar amount should generally show its time
  cost alongside it via this module, not reimplement the math.
- **Categories** are a closed set (`lib/types.ts`'s `CATEGORIES` /
  `Category`) with their icon, color, and free-text keyword list centralized
  in `lib/categories.ts` (`CATEGORY_META`). Add a category there, not
  ad hoc in a component.

## Conventions

- **Imports** use the `@/*` alias (`tsconfig.json`), never relative
  `../../` chains.
- **Components**: named export `function ComponentName(...)`, with a
  colocated `interface ComponentNameProps`. `clsx` for conditional
  classes; variant/size-driven styling uses a `Record<Variant, string>`
  lookup map defined above the component (see `components/ui/Button.tsx`),
  not scattered ternaries.
- **`"use client"`** only on files that actually need hooks, event
  handlers, or browser APIs. Pure presentational components (e.g.
  `components/ui/EmptyState.tsx`) omit it.
- **Styling** uses Tailwind utilities against the semantic tokens defined in
  `app/globals.css` (`text-foreground`, `text-secondary`, `bg-surface`,
  `border-border`, `--cat-*`, `--seq-*`, …), which flip under
  `prefers-color-scheme` with zero JS. Don't hardcode hex values or
  reimplement light/dark switching. The categorical and sequential ramps are
  a colorblind-checked dataviz palette — don't tweak those hues casually.
- **Overlays** (modals, confirm dialogs) render through `components/ui/Portal.tsx`
  into `document.body`. The header uses `backdrop-blur`, which creates a new
  containing block for `position: fixed` — skip the portal and a modal
  nested under the header will mis-position itself.
- **Comments** are reserved for non-obvious *why*, not restating the code
  (see `lib/expense-utils.ts`, `lib/parse-expense.ts` for the level of
  detail expected). Simple pure functions stay uncommented.
- **Error handling** prefers typed exhaustiveness over defensive runtime
  checks where the type system already guarantees safety (e.g.
  `CATEGORY_META[category]` — see `components/expenses/CategoryBadge.tsx`).
  Where failure is real (storage, parsing untrusted input), handle it
  explicitly and surface it via toast rather than throwing.

## Testing

**From now on, write automated tests for the code you add or change.**
This is a forward-looking policy, not a retroactive one — it doesn't
require backfilling coverage for existing untested code, only covering
what you touch going forward.

Tests run on **Vitest** (`vitest.config.mts`, single `jsdom` environment
for the whole suite) with `@testing-library/react` for hooks/components.
Test files are colocated with the code they cover, as `<name>.test.ts(x)`
next to `<name>.ts(x)` (e.g. `lib/time-cost.test.ts`,
`hooks/useCategories.test.ts`) — not a parallel `__tests__/` tree.

- **Unit tests** cover pure `lib/` functions directly (see
  `lib/time-cost.test.ts`, `lib/vendor-utils.test.ts`).
- **Integration tests** exercise a vanilla store together with real
  `lib/storage.ts` persistence (`localStorage`, via jsdom) rather than
  mocking it out, and/or a hook (`useSyncExternalStore`) rendered with
  `renderHook` on top of that store — see `lib/customCategoryStore.test.ts`
  and `hooks/useCategories.test.ts` for the pattern. Since the vanilla
  stores cache state at module scope (see **Architecture**), each test
  cleans up what it added in `beforeEach`/`afterEach` rather than relying
  on module isolation between tests in the same file.

**Before committing, the code must compile and its tests must pass.**
Run `npm run build` (or `tsc --noEmit`) and `npm test` — don't commit on
a red build or a failing test.

## Commands

```bash
npm run dev         # Turbopack dev server
npm run build       # production build
npm run start       # run the production build
npm run lint        # ESLint (eslint-config-next)
npm test            # Vitest, single run
npm run test:watch  # Vitest, watch mode
```

## Documentation

- `README.md` — product description, manual test script, project structure.
- `docs/dev/*.md` / `docs/user/*.md` — paired technical/user docs generated
  by `/document-feature <name>`.
- `ai-code-reviews/*.md` — output of `/code-review <file>`.
- `.claude/commands/*.md` — project slash commands; keep their example
  file references pointed at real files in *this* repo when editing them.

## Version control

**Important:** before making any changes, create and check out a feature
branch — never commit directly on `main` or on another already-in-progress
branch. Name it `<type>/<name>`, where `<type>` is
one of `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, matching the
conventional-commit prefix for the change. Examples: `feat/csv-export`,
`fix/heatmap-timezone-off-by-one`, `docs/csv-export-guide`.
Then commit your changes to that branch and open a pull request against `main`. The PR commit title should match the branch name, with the shortest possible description, and link to any relevant issues. Once the PR is approved and merged, delete the feature branch.

Before each commit, the code must compile and its tests must pass — see
**Testing**.

(Branch names can't contain `:` — git reserves it for refspec syntax — so
this uses `/` as the separator instead of the `feat:`/`fix:` colon form
those prefixes take in commit messages.)
