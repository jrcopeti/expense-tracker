# Clarity — Expense Tracker

A modern, responsive expense tracker built with Next.js (App Router), TypeScript,
Tailwind CSS, and Recharts. All data is stored in your browser's `localStorage` —
there is no backend or account, so it's yours alone and never leaves your machine.

## Features

- **Dashboard** — total spending, this-month spend (with a vs-last-month delta),
  transaction count, top category, a category breakdown chart, a 6-month spending
  trend chart, and a recent-activity list.
- **Expenses** — add, edit, and delete expenses; search by description; filter by
  category and date range; sort by date or amount; export the current view to CSV.
- **Validation** — every field is validated (required amount > 0, required date not
  in the future, required category, required description) with inline errors.
- **Responsive** — a data table on desktop/tablet, stacked cards on mobile, and a
  collapsible nav menu on small screens.
- **Sample data** — from an empty dashboard, click "Load sample data" to explore
  the app with ~6 months of realistic expenses instead of starting from scratch.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard starts empty —
click **Load sample data** to populate it instantly, or **Add expense** to enter
your own.

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build (after `npm run build`)
npm run lint    # ESLint
```

## Manually testing every feature

1. **Empty state** — on first load (or after clearing `localStorage`), the
   dashboard shows a "Welcome to Clarity" empty state with two actions.
2. **Sample data** — click "Load sample data"; the dashboard should populate with
   25 expenses, stat cards, and both charts.
3. **Add an expense** — go to *Expenses* → *Add expense*. Try submitting empty to
   see validation errors; then fill in a date, amount, category, and description
   and submit — a success toast appears and the row shows up at the top.
4. **Edit** — hover a row (or, on mobile, just tap) and click the pencil icon;
   change a field and save.
5. **Delete** — click the trash icon; confirm in the dialog; the row disappears
   and a toast confirms it.
6. **Search & filter** — type in the search box to filter by description; pick a
   category; set a date range; change the sort order. The header count/total
   updates to match the filtered set. "Clear filters" resets everything.
7. **Export CSV** — with any filter combination applied, click "Export CSV" — it
   downloads exactly the filtered/sorted rows you're looking at.
8. **Dashboard charts** — hover the category bars or the trend line to see
   tooltips with exact amounts.
9. **Responsiveness** — resize the window (or open dev tools' device toolbar):
   the stat grid, charts, and expense list all reflow, and the nav collapses into
   a hamburger menu under `sm` width.
10. **Persistence** — refresh the page; your data is read back from
    `localStorage` (skeletons appear only for a moment while that resolves).

## Project structure

```
app/
  page.tsx              Dashboard route
  expenses/page.tsx      Expenses route
  layout.tsx             Root layout (nav, providers, toaster)
  globals.css             Design tokens (light/dark, categorical palette)
components/
  dashboard/              Stat cards, charts, recent-expenses list
  expenses/                Filter bar, list/table, add-edit modal, category badge
  layout/                  Header/nav
  ui/                      Button, Card, Field, EmptyState, Skeleton, ConfirmDialog
context/
  ExpenseContext.tsx       React context wrapping the expense store
lib/
  expenseStore.ts          Vanilla store (useSyncExternalStore-backed) + localStorage
  storage.ts, csv.ts, format.ts, validation.ts, expense-utils.ts, types.ts, categories.ts
```

## Notes

- Category colors and chart styling follow a colorblind-validated palette (each
  category keeps the same color everywhere — badges, table, charts).
- Light/dark mode follows your OS setting automatically.
- Built on Next.js 16 with Turbopack; see `AGENTS.md` if you're upgrading Next.js
  further, since this major version has notable breaking changes from earlier ones.
