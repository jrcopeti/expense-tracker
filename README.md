# Hourglass — Spend Time Wisely

Most expense trackers make you do bookkeeping and hope a pie chart changes your
behavior. Hourglass tries something different: it converts every dollar into
the **hours of your life** it cost, and leads with that instead of a total.
Everything else follows from that one idea.

All data lives in your browser's `localStorage` - no backend, no account.

## What's different here

- **Time, not just money.** Set your hourly rate (directly, or calculated from
  monthly income) once, and every expense, category, and monthly total is
  shown in hours-of-work alongside its dollar amount. The dashboard's hero
  number is *"This month cost you 12h 9m"*, not a dollar total.
- **Type it like you'd say it.** The primary way to log a expense is one line
  of free text - `"12.50 coffee"`, `"gas 40 yesterday"`, `"lunch with sara
  9.75"`. A small on-device parser guesses the amount, category, and date;
  logging is instant, and a toast lets you fix a bad guess in one click. (A
  full field-by-field form is always one click away too, for anyone who
  prefers it.)
- **A spending heatmap, not a bar chart.** The dashboard leads with a
  GitHub-contributions-style calendar of the last 6 months - click any day to
  see (and edit) exactly what you spent, right inline.
- **Streaks.** Set an optional daily budget and Hourglass tracks your current
  streak of days at or under it - a no-spend day counts as a win.
- **"Where your time goes"** - a category breakdown in hours of work, not
  dollars, so you can see at a glance what's actually eating your life.

Categories, search/filter/sort, edit/delete, CSV export (now with an Hours
column), validation, responsive layout, and light/dark mode are all still
here - the full-featured tracker is intact underneath the new framing.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first load, click
**Load sample data** to see six months of activity immediately (it also sets
a demo hourly rate so the time-cost framing is visible right away) - or just
start typing into the quick-add box.

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # ESLint
npm test        # Vitest, single run
```

## Manually testing everything

1. **Quick capture** - type `"14.50 lunch with sara"` into the box at the top
   and hit *Log it*. A toast confirms the parsed amount/category/description
   and its time cost, with an *Edit* link if the guess needs fixing. Try a
   line with no number in it (e.g. `"just coffee"`) - it should show an inline
   error and add nothing.
2. **Settings** - click the gear icon. Toggle between "Calculate it" (monthly
   income + hours/week) and "I know my rate" (direct hourly figure); the
   preview line updates live. Set a daily budget and save - a streak badge
   should appear on the dashboard.
3. **Heatmap** - click any colored day in "Spending rhythm" to open its detail
   panel below, showing every expense logged that day with an edit shortcut.
   Click the same day again to close it.
4. **Full form, edit, delete** - use the list icon next to *Log it* to open
   the complete form (with a live "≈ this many minutes of your life" preview
   as you type an amount). Edit or delete any row from the Expenses table.
5. **Custom categories** - in that form, pick *+ Add new category…* from the
   Category dropdown, name it (e.g. "Subscriptions"), pick one of the icons
   in the grid below the name field, and confirm it's selected and shows up
   immediately - with that icon - in the filter bar, expense list, and
   "Where your time goes." Typing that name into quick-capture (e.g.
   `"9.99 subscriptions"`) should now match it automatically. The first two
   custom categories get their own color; a third still works, just with a
   neutral badge color instead of a new one (see `lib/categories.ts` for
   why).
6. **Filters & export** - search, filter by category/date range, sort, then
   export - the CSV includes exactly the filtered rows plus an Hours column.
7. **Responsiveness** - resize the window; the heatmap scrolls horizontally,
   the table becomes cards, and the nav collapses into a hamburger menu.

## Project structure

```
app/
  page.tsx              Dashboard (hero, streak, heatmap, category-hours chart)
  expenses/page.tsx      Full list: quick-capture, filters, table, CSV export
  layout.tsx             Root layout (nav, toaster)
components/
  dashboard/              StatCard, HeatmapCalendar, CategoryTimeChart, DayDetail, StreakBadge
  expenses/                QuickCapture, ExpenseFormModal, FilterBar, ExpenseList, CategoryBadge
  settings/                SettingsModal (hourly rate / income, daily budget)
  layout/                  Header/nav
  ui/                      Button, Card, Field, EmptyState, Skeleton, ConfirmDialog, Portal
hooks/
  useExpenses.ts, useSettings.ts, useCategories.ts   useSyncExternalStore-backed, no Context needed
lib/
  time-cost.ts             The core reframe: dollars -> hours of work
  parse-expense.ts         The free-text quick-capture parser
  categories.ts             Built-in category metadata + resolveCategoryMeta (built-in or custom)
  expenseStore.ts, settingsStore.ts, customCategoryStore.ts, storage.ts, csv.ts, format.ts,
  validation.ts, expense-utils.ts (incl. heatmap bucketing + streak calc), types.ts
```

## Notes

- Tests run on Vitest (`npm test`) and are colocated as `<name>.test.ts(x)`
  next to the code they cover (e.g. `lib/time-cost.test.ts`,
  `hooks/useCategories.test.ts`) rather than in a separate `__tests__/`
  tree — see `CLAUDE.md`'s **Testing** section for the policy and
  conventions.
- All overlays (modals, confirm dialogs) render through a `Portal` into
  `document.body`. The header uses `backdrop-blur`, and per the CSS spec that
  creates a new containing block for `position: fixed` descendants - without
  the portal, a modal nested under the header would position itself relative
  to the header's small box instead of the viewport.
- Category and heatmap colors follow a colorblind-validated palette (each
  category keeps one consistent color everywhere); "Hourglass" itself uses a
  warm sand accent, contrast-checked against its own foreground.
- Built on Next.js 16 with Turbopack; see `AGENTS.md` if upgrading further.
