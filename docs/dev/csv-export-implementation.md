# CSV Export — Implementation

Turns the currently filtered expense list into a downloadable CSV, with a
per-row time-cost column derived from the user's configured wage.

**Classification:** Full-stack (thin) — one pure data-layer module plus a
single UI trigger. No new state, store, or persistence.

## Relevant files

- `lib/csv.ts:9` — `expensesToCsv(expenses, settings)` builds the CSV string
  (header row + one row per expense).
- `lib/csv.ts:4` — `escapeCsvField` quotes/escapes a field if it contains a
  comma, quote, or newline.
- `lib/csv.ts:24` — `downloadCsv` triggers the actual browser download via a
  `Blob` + a temporary, immediately-removed `<a>` element.
- `app/expenses/page.tsx:30` — `handleExport` wires the button to the
  *filtered* list, guards the empty case, calls `downloadCsv`, shows a toast.
- `app/expenses/page.tsx:50` — the "Export CSV" `Button` that calls
  `handleExport`.
- `lib/time-cost.ts:15` — `amountToHours` computes each row's hours-of-work
  figure from the amount and the user's `Settings`.
- `lib/time-cost.ts:25` — `formatHours` renders that figure as `"2h 15m"`.

## Data flow

No new state is introduced. The page already holds `Expense[]` (via
`useExpenses()`) and `Settings` (via `useSettings()`) at
`app/expenses/page.tsx:21-22`; export reads the same `filtered` array the
table renders (`app/expenses/page.tsx:27`), so the CSV always matches what's
on screen. CSV columns map directly onto `lib/types.ts`'s `Expense` fields
(`date`, `category`, `description`, `amount`) plus one derived column —
"Hours of work" — computed from `Settings.hourlyWage` /
`Settings.monthlyIncome` (`lib/types.ts`), not stored anywhere.

## Edge cases and error handling

- **Empty filtered list** — `handleExport` (`app/expenses/page.tsx:31-34`)
  shows an error toast and returns *before* calling `downloadCsv`; no empty
  file is ever generated.
- **Fields with commas/quotes/newlines** — `escapeCsvField`
  (`lib/csv.ts:4-7`) wraps the field in quotes and doubles internal quotes,
  so a description like `"lunch, coffee"` doesn't split into extra columns.
- **No hourly wage configured** — `amountToHours` returns `null`
  (`lib/time-cost.ts:15-19`) when `effectiveHourlyWage` can't derive a rate;
  `expensesToCsv` (`lib/csv.ts:18`) writes an empty string for that row's
  Hours column rather than `"NaN"` or throwing.
- **Repeated exports on the same day** — not handled explicitly. The
  filename is always `hourglass-expenses-{ISO date}.csv`
  (`lib/csv.ts:29-31`); a second export the same day relies on the browser's
  own download-dedup (e.g. `(1)` suffix), not app logic.

## For end users

See [How to export your expenses to CSV](../user/how-to-export-expenses-to-csv.md).

## Related docs

- [`README.md` — Manually testing everything, step 5](../../README.md#manually-testing-everything)
  already covers export from a QA angle ("the CSV includes exactly the
  filtered rows plus an Hours column").
- [`README.md` — Project structure](../../README.md#project-structure) lists
  `lib/csv.ts` alongside the other `lib/` modules.
