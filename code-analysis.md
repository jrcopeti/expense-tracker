# Data Export Feature — Comparative Code Analysis

Three independent implementations of "export your expense data," each on its own
branch, all diverging from the same commit (`hourglass` @ `65b1464`). Because
they share an identical base, every diff below is exact — `git diff 65b1464
<branch>` — not reconstructed from memory.

| | v1 | v2 | v3 |
|---|---|---|---|
| Branch | `feature-data-export-v1` | `feature-data-export-v2` | `feature-data-export-v3` |
| Commit | `f40bb83` | `406e89c` | `aeab282` |
| Files touched | 2 | 18 | 34 |
| Lines changed | +36 / −1 | +1,019 / −1 | +2,367 / −5 |
| New dependencies | none | `jspdf`, `jspdf-autotable` | `jspdf`, `jspdf-autotable`, `qrcode` |
| UI surface | 1 button | 1 drawer | 1 new page + 1 new route |

A structural note that applies to all three: none of them touch
`app/expenses/page.tsx`, which already has its own "Export CSV" button (see
`lib/csv.ts::downloadCsv`, settings-aware, includes an "Hours of work"
column). Every version below is a **second, independent export entry point**
layered on top of that pre-existing one, not a replacement for it. That's a
cross-cutting observation worth keeping in mind throughout — see
[Redundant export surfaces](#redundant-export-surfaces) at the end.

---

## v1 — Simple CSV Button

### Files created/modified
- `app/page.tsx` (+13/−1) — one button, one handler
- `lib/csv.ts` (+24) — one new exported function, appended to the existing file

That's the entire implementation: two files, 36 lines, zero new dependencies.

### Code architecture overview
No architecture to speak of, by design. `exportExpensesToCsv(expenses)` is a
single free function that does everything synchronously and imperatively:
build a CSV string, wrap it in a `Blob`, create an `<a>`, click it, remove it,
revoke the object URL. It's called directly from an inline `onClick` handler
on the dashboard page. There is no intermediate state, no component
hierarchy, no configuration surface.

### Key components and responsibilities
- **`handleExportData()`** (in `app/page.tsx`) — calls the export function,
  fires a success toast. That's its whole job.
- **`exportExpensesToCsv()`** (in `lib/csv.ts`) — filtering (none), formatting
  (four columns), and the download mechanics, all in one ~20-line function.

There's no reuse of the existing `lib/csv.ts::expensesToCsv`/`downloadCsv`
pair already in the file (which is settings-aware and includes an hours
column) — v1 adds a second, deliberately simpler function side-by-side,
documented with a comment explaining why they're kept separate.

### Libraries and dependencies
None beyond what the app already had. Pure browser APIs: `Blob`,
`URL.createObjectURL`, a synthetic `<a download>` click.

### Implementation patterns
Procedural/imperative. No reducer, no form state, no async — the whole
operation is a synchronous function call inside an event handler.

### Code complexity assessment
Minimal. Cyclomatic complexity is essentially 1 for the export function (a
`.map()` and a `.join()`, no branching). This is the easiest of the three to
read top-to-bottom in under a minute and hold entirely in working memory.

### Error handling approach
None, functionally. There's no `try/catch` anywhere in the new code.
`Blob`/`URL.createObjectURL`/`link.click()` essentially never throw in
practice in a modern browser, so this is a defensible choice for the scope,
but it does mean:
- A `localStorage`-style persistence failure isn't a concern here (nothing is
  persisted), but there's also no signal if `URL.createObjectURL` were ever
  unavailable (e.g., an unusual embedded webview).
- The success toast fires unconditionally — it assumes the download
  succeeded rather than confirming it. (This is normal for this browser API;
  there's no callback for "the user actually saved the file.")

### Security considerations
- **CSV/formula injection**: the description field is written into the CSV
  raw (`escapeCsvField` only escapes commas/quotes/newlines, not a leading
  `=`, `+`, `-`, or `@`). A description like `=cmd|'/c calc'!A1` would be
  preserved verbatim and could execute as a formula if the CSV is opened in
  Excel/Sheets with legacy settings. **This is present in all three
  versions** (they all reuse the same minimal escaping logic) — flagged once
  here, applies equally below.
- No data leaves the browser; the whole operation is local.

### Performance implications
Negligible. Building the CSV string is O(n) in expense count with no
noticeable cost until datasets are very large (thousands of rows), at which
point the only concern is a single large string allocation — not a real
issue at this app's scale.

### Extensibility and maintainability factors
- **Pro**: trivially maintainable. A future change to the CSV shape is a
  one-function edit.
- **Con**: not extensible by design. Adding a second format, a filter, or a
  preview would mean either duplicating the whole function again or
  rewriting it into something closer to v2/v3's shape. There's no seam to
  hang new behavior off of.

---

## v2 — Advanced Local Export Drawer

### Files created/modified
```
app/globals.css                        (+11)   slide-in keyframe
app/page.tsx                           (+11/−1) wires the drawer trigger
components/export/CategoryDot.tsx      (+12)
components/export/CategoryFilter.tsx   (+51)
components/export/DateRangeFilter.tsx  (+69)
components/export/ExportDrawer.tsx     (+171)  the shell/orchestrator
components/export/FormatPicker.tsx     (+49)
components/export/PreviewTable.tsx     (+57)
hooks/useExportForm.ts                 (+78)   reducer-based form state
lib/export/download.ts                 (+17)   shared blob-download + filename sanitizer
lib/export/filters.ts                  (+57)   pure filter/preset logic
lib/export/runExport.ts                (+36)   orchestration entry point
lib/export/serializers/csv.ts          (+18)
lib/export/serializers/json.ts         (+25)
lib/export/serializers/pdf.ts          (+66)
lib/export/types.ts                    (+41)
package.json / package-lock.json       jspdf, jspdf-autotable
```
18 files, +1,019/−1.

### Code architecture overview
A proper layered architecture:
- **`lib/export/`** — pure, framework-free data layer. `types.ts` defines the
  shared shapes (`ExportFormat`, `ExportFilters`, `ExportPayload`, etc.);
  `filters.ts` is pure filtering/date-preset math with no I/O;
  `serializers/{csv,json,pdf}.ts` each take an `ExportPayload` and return a
  `Blob`, nothing else; `download.ts` is the one place that touches the DOM
  (`URL.createObjectURL`, the synthetic anchor); `runExport.ts` is the single
  async entry point that composes all of the above.
- **`hooks/useExportForm.ts`** — a `useReducer` state machine for the
  drawer's form (format, filters, filename, status), decoupled from any one
  component.
- **`components/export/`** — presentational pieces (`FormatPicker`,
  `DateRangeFilter`, `CategoryFilter`, `PreviewTable`) each taking
  value/onChange props, composed inside `ExportDrawer.tsx`, which also owns
  the dialog chrome (portal, backdrop, slide-in panel, header/body/footer).

This is a clean **unidirectional-data-flow** design: `ExportDrawer` reads
`state` from the reducer, derives `filtered`/`total` via `useMemo` off pure
functions in `lib/export/filters.ts`, and the *same* filter function
(`selectExpensesForExport`) is used both for the live preview and for the
real export — so the preview can never lie about what will actually be
exported (they're not two implementations of "apply the filters," they're one).

### Key components and responsibilities
- **`ExportDrawer`** — orchestrator. Owns the reducer, computes derived
  preview data, calls `runExport`, handles the async try/catch, renders the
  dialog shell and delegates each concern (format, dates, categories,
  filename, preview) to a child.
- **`useExportForm`** — all state transitions in one `reducer()` switch,
  independently readable/testable from any component.
- **`FormatPicker` / `DateRangeFilter` / `CategoryFilter`** — controlled,
  stateless presentational components.
- **`PreviewTable`** — read-only render of up to 6 rows with a "+N more"
  footer; has its own empty state.
- **`runExport`** — the seam between UI and I/O: takes raw expenses +
  options, filters, serializes, downloads, returns a result summary.

### Libraries and dependencies
`jspdf` + `jspdf-autotable`, dynamically imported inside `serializers/pdf.ts`
(`await Promise.all([import("jspdf"), import("jspdf-autotable")])`) — so the
~200KB dependency is only fetched when a user actually picks PDF; CSV/JSON
exports never pay for it. Everything else is the app's existing stack
(`clsx`, `lucide-react`, `react-hot-toast`).

### Implementation patterns
- Reducer-based local state (vs. v1's none, v3's several independent
  `useSyncExternalStore`-backed stores).
- Pure-function core (`lib/export/filters.ts`, the serializers) with all
  side effects pushed to the edges (`download.ts`, the reducer's dispatch
  calls) — a fairly disciplined functional-core/imperative-shell split for a
  UI feature this size.
- A `Portal` (existing app primitive) is used to render the drawer into
  `document.body`, sidestepping a real bug this app hit earlier in
  development: the header uses `backdrop-filter`, which creates a new CSS
  containing block for `position: fixed` descendants, so an un-portaled
  overlay nested under it would render in the wrong place.

### Code complexity assessment
Moderate, appropriately distributed. No single file is complex in isolation
(`ExportDrawer.tsx` is the largest at 171 lines and is mostly JSX, not
branching logic); the complexity is in the *number* of small, single-purpose
files rather than deep logic in any one of them. The reducer's `switch` has
9 cases but each is 1–3 lines.

### Error handling approach
The most complete of the three:
- `ExportDrawer.handleExport` wraps `runExport` in `try/catch`, dispatches
  `EXPORT_ERROR` on failure, and shows an error toast with either the
  caught message or a fallback ("Export failed - please try again.").
- The reducer models `status: "idle" | "exporting" | "done" | "error"`
  explicitly, so the UI always knows what state it's in.
- The Export button is `disabled` whenever `filtered.length === 0` — the
  empty-selection case is handled at the UI level, not just via a toast
  after the fact.
- Close/Escape are disabled mid-export (`disabled={isExporting}` on the close
  button, and the Escape handler checks `!isExporting`), preventing a user
  from dismissing the drawer while a download is in flight.
- **Gap**: `sanitizeFilename` (in `download.ts`) strips illegal filename
  characters but silently — there's no UI feedback if a user's filename
  input gets heavily rewritten before the file is saved.

### Security considerations
Same CSV-injection caveat as v1 (shared escaping logic). Filenames are
sanitized against a fixed blacklist (`/[/\\?%*:|"<>]/g`) before being handed
to `link.download`, which is good practice given the filename is
user-supplied free text. No data leaves the browser.

### Performance implications
- The PDF path's dynamic import is the one meaningful performance-conscious
  decision here — genuinely defers ~200KB off the CSV/JSON hot path.
- `selectExpensesForExport` re-filters and re-sorts the *entire* expense
  array on every filter change (`useMemo` keyed on `[expenses, state.filters]`
  avoids redundant recomputation across renders, but each real filter change
  is still a full O(n log n) sort). Fine at this app's scale (hundreds of
  rows); would need a rethink at tens of thousands.
- `PreviewTable` renders at most 6 rows regardless of dataset size, so the
  preview itself never becomes a rendering bottleneck.

### Extensibility and maintainability factors
- **Pro**: adding a fourth format means adding one file in
  `serializers/` and one line in `runExport.ts`'s switch — the architecture
  was clearly built anticipating this. Adding a new filter dimension (e.g.,
  amount range) is a reducer action + a new component, following the
  existing pattern exactly.
- **Pro**: the `lib/export/` layer has zero React/DOM dependencies (except
  `download.ts`), so it's unit-testable in isolation and reusable outside
  the drawer (in fact v3 copies this layer nearly verbatim — see below).
- **Con**: the reducer and the drawer component are moderately coupled to
  each other's shape (the drawer dispatches action objects with exact type
  strings); a second consumer of the same form logic would need to import
  both together, which is fine here since there's only one consumer.

---

## v3 — Cloud-Integrated Export Hub

### Files created/modified
```
app/export/page.tsx                              (+99)   the hub page
app/shared/page.tsx                               (+97)   public read-only report viewer
app/layout.tsx                                     (+2)   mounts ScheduledBackupRunner
components/expenses/CategoryDot.tsx               (+12)
components/export-hub/ConnectModal.tsx           (+136)   mock OAuth flow
components/export-hub/ConnectionCard.tsx           (+78)
components/export-hub/EmailExportModal.tsx        (+162)
components/export-hub/HistoryTable.tsx             (+60)
components/export-hub/ScheduleCard.tsx            (+123)
components/export-hub/ScheduledBackupRunner.tsx    (+28)
components/export-hub/ShareCard.tsx               (+123)
components/export-hub/StatusChip.tsx               (+27)
components/export-hub/TemplateCard.tsx             (+82)
components/layout/Header.tsx                        (+8/−0) nav link, hides chrome on /shared
hooks/useConnections.ts                            (+17)
hooks/useExportHistory.ts                          (+16)
hooks/useLocationHash.ts                           (+21)
hooks/useSchedule.ts                               (+18)
lib/export-templates.ts                            (+43)   Tax Report / Monthly Summary / Category Analysis
lib/export/{types,filters,download,runExport}.ts  (≈220)   ported from v2, near-identical
lib/export/serializers/{csv,json,pdf}.ts          (≈105)   ported from v2, near-identical
lib/format.ts                                       (+25)  formatRelativeTime()
lib/integrations/connectionsStore.ts                (+76)
lib/integrations/historyStore.ts                    (+75)
lib/integrations/scheduleStore.ts                  (+131)
lib/integrations/types.ts                           (+55)
lib/share.ts                                         (+55)  URL-encoded share payload
package.json / package-lock.json          jspdf, jspdf-autotable, qrcode, @types/qrcode
```
34 files, +2,367/−5 — roughly 2.3× the size of v2, spread across two new
routes and three new subsystems (connections, scheduling, sharing) on top of
a data layer largely inherited from v2.

### Code architecture overview
Four semi-independent subsystems, each following the same
`useSyncExternalStore`-backed "vanilla store" pattern already established
elsewhere in this app (`lib/expenseStore.ts`, `lib/settingsStore.ts` from the
core app, predating this feature):

1. **`lib/export/`** — the same pure filter/serializer layer as v2, copied
   into this branch (this branch was created from the same base as v2, not
   from v2 itself, so this is a parallel port rather than a shared commit
   history — the two implementations can drift independently).
2. **`lib/integrations/`** — three independent localStorage-backed stores:
   - `connectionsStore.ts` — per-service (`google-sheets` / `dropbox` /
     `onedrive`) connection status, mock email, timestamps.
   - `scheduleStore.ts` — a single backup schedule (frequency, format,
     destination) plus the "catch-up" runner logic (see Technical Deep
     Dive).
   - `historyStore.ts` — an append-only, capped (50-entry) log of past
     export actions from *any* subsystem.
3. **`lib/share.ts`** — stateless encode/decode of a summary payload into a
   URL-safe base64 string, plus a `buildShareUrl()` helper.
4. **UI layer** (`components/export-hub/`) — one component per concern
   (`TemplateCard`, `ConnectionCard` + `ConnectModal`, `EmailExportModal`,
   `ScheduleCard`, `ShareCard`, `HistoryTable`, `StatusChip`), composed in
   `app/export/page.tsx`.

Each store exposes the same shape — `subscribe`/`getSnapshot`/
`getServerSnapshot` plus a handful of mutator functions — and each has a
matching `hooks/use*.ts` wrapper that adds `useSyncExternalStore` +
`useIsClient()` for hydration-safe loading state. This is the most
*repetitive* of the three architectures (four near-identical store modules)
but also the most *consistent* — there's exactly one way state is managed
anywhere in this feature, no exceptions.

### Key components and responsibilities
- **`ConnectModal`** — a three-step local state machine
  (`signin → consent → connecting`) simulating an OAuth consent screen, per
  service (permissions list comes from `CONNECTION_META`).
- **`ScheduledBackupRunner`** — a headless (`return null`) component mounted
  once in the root layout; its only job is to call
  `runDueBackupIfNeeded(expenses)` once per app load.
- **`ShareCard`** — computes a category-level summary (via the existing
  `totalsByCategory` from `lib/expense-utils.ts`, not new code), builds a
  share URL, and dynamically imports `qrcode` to render it as a QR data URL.
- **`app/shared/page.tsx`** — a second, distinct page that decodes
  `window.location.hash` via `useLocationHash()` and renders a read-only
  summary card; deliberately has **no** access to the app's expense store
  (it only ever sees what's in the URL), which is the actual privacy
  boundary of the "share" feature.
- **`TemplateCard`** — self-contained: computes its own match count, runs
  its own export, logs its own history entry, manages its own loading state.

### Libraries and dependencies
`jspdf` + `jspdf-autotable` (same as v2, same dynamic-import treatment) plus
`qrcode` (+ `@types/qrcode`), also dynamically imported
(`await import("qrcode")` inside `ShareCard.handleGenerate`) so it's not in
the initial bundle for users who never generate a share link.

### Implementation patterns
- **Vanilla external stores + `useSyncExternalStore`**, applied four times
  over (connections, schedule, history, plus the reused expense/settings
  stores) — this is the dominant pattern in this version, versus v2's single
  `useReducer`.
- **URL-as-database**: the share feature has no server-side persistence at
  all; the entire "record" is the base64 payload in the URL fragment. This
  is a deliberate, unusual-for-this-scope pattern, and it's the one piece of
  this version that's genuinely novel rather than a restyled version of
  something else in the app.
- **Explicit simulation boundaries**: every faked integration is labeled in
  its own UI copy ("Demo mode: this simulates sending an email...", "Demo —
  connections are simulated, nothing leaves your browser"). This is a
  deliberate implementation choice, not an oversight — worth noting because
  it directly affects the "is this misleading" security/trust question
  below.

### Code complexity assessment
The highest of the three, but mostly *breadth*, not *depth*. No individual
function is hard to follow (the most complex piece, `scheduleStore.ts`'s
`runDueBackupIfNeeded`, is a linear sequence: check due → export → log →
reschedule). The complexity is in the number of moving parts: 4 stores, 4
hooks, 9 components, 2 routes, all needing to stay consistent with each
other (e.g., every place that "does an export" — templates, scheduled
backups, email — has to remember to also call `logExport()`; nothing
enforces that centrally, so a future new export path could easily forget to
log itself).

### Error handling approach
Weaker than v2's, and inconsistent within itself:
- `TemplateCard` and `ShareCard` both wrap their async work in `try/catch`
  with a user-facing error toast — good.
- **`ScheduledBackupRunner` does not.** `runDueBackupIfNeeded(expenses).then(...)`
  has no `.catch()`. If the scheduled export throws (e.g., the dynamic
  `jspdf` import fails offline, or `runExport` throws for any reason), this
  becomes an unhandled promise rejection with **no user-facing feedback at
  all**, and — because the schedule's `nextRunAt` is only advanced *after* a
  successful run inside the same function — the backup would silently stay
  "due" and retry (and potentially fail again) on every subsequent app load
  with no visible error state.
- The three `lib/integrations/*Store.ts` `persist()` functions swallow
  `localStorage` write failures silently (`catch { /* best-effort */ }`)
  and, unlike the app's pre-existing `expenseStore.ts`/`settingsStore.ts`
  (which return a `boolean` so callers can `toast.error` on failure), **do
  not report failure to their callers at all**. A user in Safari private
  mode who "connects" an integration or enables a schedule would see it
  work for the current session and silently lose it on reload, with no
  warning — a regression in honesty compared to the rest of this app's
  established pattern.
- `ConnectModal` and `EmailExportModal` have no real failure path to handle
  (they're simulated — the only "failure" is client-side validation, e.g.
  `!email.includes("@")`, which just blocks the Continue/Send button).
- `app/shared/page.tsx` handles its one real edge case well: an invalid or
  missing hash renders an explicit "This link looks broken" empty state
  rather than crashing or showing a blank/zeroed report.

### Security considerations
- Same CSV-injection caveat as v1/v2 (identical escaping logic, ported
  as-is).
- **Share links are obfuscated, not encrypted or access-controlled.** The
  payload is plain base64 (`btoa`-based, URL-safe alphabet) — anyone with
  the link can decode it trivially (it's designed to be readable, not
  secret), and by design it only carries category-level totals, never
  individual transaction descriptions. This is a reasonable and honestly-
  documented tradeoff for a backend-less app, but it's worth stating
  explicitly: this is "unlisted," not "private."
- **Simulated integrations are clearly labeled as simulated** in-product
  (the demo badge on the hub page, "no data leaves your browser" /
  "nothing was actually sent" copy on the connect and email modals). This
  matters because a cloud-integration feature that *looked* real but did
  nothing would be a trust problem; this version was deliberately built to
  avoid that.
- Mock account emails typed into `ConnectModal` are stored in
  `localStorage` in plaintext alongside the rest of the app's data. Since
  they're user-invented demo values with no real authentication behind
  them, this isn't a meaningful exposure — but it's worth noting if this
  pattern were ever extended toward real OAuth (a real implementation would
  never persist tokens/PII this way client-side without encryption).
- `app/shared/page.tsx` never touches the expense store — it's structurally
  incapable of leaking anything beyond what's already in the URL, which is
  a reasonable-by-construction privacy boundary rather than something that
  has to be remembered and enforced by convention.

### Performance implications
- Both heavy dependencies (`jspdf`+`autotable`, `qrcode`) are dynamically
  imported at their actual point of use, not at page load — the `/export`
  route's initial bundle doesn't pay for either unless the corresponding
  action is taken.
- `ScheduledBackupRunner` runs its due-check on **every app load** (any
  page, via the root layout), guarded by a `useRef` so it only checks once
  per mount — cheap (a `localStorage` read + a date comparison) when nothing
  is due, but note it *is* wired into every route's initial render, not just
  `/export`.
- `historyStore` caps itself at 50 entries (`.slice(0, MAX_ENTRIES)` on every
  write), which is a sensible bound but means old history is silently
  discarded with no archival — fine for a demo, worth flagging if history
  were ever expected to be a durable record.
- The `/shared` page's summary computation (`totalsByCategory`) runs on
  whatever subset of expenses the *sender* chose at generation time, not on
  the recipient's data — the recipient's page does no computation over their
  own (likely nonexistent or unrelated) expense list, so there's no
  accidental data-mixing risk there.

### Extensibility and maintainability factors
- **Pro**: the four-store pattern is highly consistent and easy to extend
  by copying an existing store file — adding a fourth "connection" (e.g.
  Notion) is almost entirely data (`CONNECTION_META`), not new logic.
- **Pro**: `app/shared/page.tsx` and the rest of the app are cleanly
  decoupled (no shared state, only a URL contract via `lib/share.ts`), so
  the share feature could be extracted or moved without touching anything
  else.
- **Con**: the export-logging convention ("every export path must remember
  to call `logExport()`") is enforced by discipline, not by the type system
  or a shared wrapper — a maintainability risk as more export paths get
  added.
- **Con**: because `lib/export/` was *copied* into this branch rather than
  shared with v2, any future bugfix to the filter/serializer layer (e.g. the
  CSV-injection gap noted above) would need to be applied in both places
  independently if both branches are kept alive or merged separately.

---

## Technical Deep Dive

### How does the export functionality work technically, in each version?

- **v1**: `expenses.map()` → array-of-arrays → `.join(",")` per row → one
  big string → `Blob` → object URL → synthetic `<a download>` click →
  revoke the URL. One function, no intermediate representation.
- **v2**: UI state (reducer) → `selectExpensesForExport(expenses, filters)`
  (pure) → `ExportPayload` object → format-specific serializer
  (`buildCsvBlob`/`buildJsonBlob`/`buildPdfBlob`, each pure, each returning
  a `Blob`) → `downloadBlob()` (the one DOM-touching function, same
  Blob→URL→anchor→revoke sequence as v1, but factored out and reused across
  all three formats and, later, by v3 too).
- **v3**: Same pipeline as v2 for templates and scheduled backups
  (`runExport()` is used verbatim). Email export doesn't use this pipeline
  at all — `EmailExportModal` never calls `runExport`; it just computes a
  count/total for display and logs a history entry, since there's no real
  attachment to generate for a simulated send. The share feature is a
  wholly separate pipeline: no `Blob`, no download — `lib/share.ts` encodes
  a small summary object directly into the URL.

### What file generation approach is used?

All three ultimately produce a `Blob` and trigger a browser download via a
synthetic `<a download>` click — there is no server involved anywhere, in
any version; every file is generated entirely in the browser. The
CSV/JSON serializers build strings directly. The PDF serializer (v2 and v3,
identical approach) uses `jsPDF` + `jspdf-autotable`, dynamically imported,
to draw a formatted table and return `doc.output("blob")` rather than
calling `jsPDF`'s own built-in `doc.save()` — a deliberate choice so PDF
output can flow through the exact same `downloadBlob()` function as CSV and
JSON, keeping one download code path instead of three.

### How is user interaction handled?

- **v1**: a single synchronous `onClick`.
- **v2**: a reducer-driven form inside a portal-rendered drawer; every
  control is controlled (value + onChange dispatch), the preview and the
  summary re-derive from state via `useMemo`, and the actual export is a
  single `async` handler with explicit loading/error states.
- **v3**: many independent small interactions across many components,
  each managing its own local state (a modal's step, a card's
  `isRunning` flag) rather than one shared form — appropriate given these
  are genuinely independent actions (connecting a service is unrelated to
  running a template export), but it does mean there's no single place to
  see "the state of an export" the way v2's reducer provides.

### What state management patterns are used?

- **v1**: none — no state beyond the DOM itself.
- **v2**: one `useReducer` state machine, local to the drawer component,
  discarded when the drawer closes (each open is a fresh instance).
- **v3**: persistent, app-wide state via the vanilla-store +
  `useSyncExternalStore` pattern (four separate stores), so connections,
  schedule, and history all survive across navigation and page reloads —
  a materially different state *lifetime*, not just a different mechanism,
  from v2's ephemeral form state. This is the right choice for v3's domain
  (a "connection" that disappeared on navigation wouldn't make sense) but
  is also why v3 needed roughly 4× the state-management code of v2.

### How are edge cases handled?

| Edge case | v1 | v2 | v3 |
|---|---|---|---|
| Zero expenses to export | Exports a header-only CSV silently | Export button disabled when filtered count is 0 | `TemplateCard` shows "No data yet" instead of a Generate button when its filter matches nothing; the hub page shows an empty state before any cards render if there are no expenses at all |
| Invalid/missing share link | n/a | n/a | Explicit "This link looks broken" state (`decodeSharePayload` returns `null` on any decode/parse failure, caught) |
| Closing mid-export | n/a (synchronous) | Close button and Escape both disabled while `status === "exporting"` | Same pattern applied to `ConnectModal` (disabled while `"connecting"`) and `EmailExportModal` (disabled while `"sending"`) |
| Scheduled export fails | n/a | n/a | **Not handled** — unhandled promise rejection, no user feedback (see Error handling above) |
| `localStorage` unavailable/full | n/a (nothing persisted) | n/a (nothing persisted) | Silently degrades per-store; no user-facing warning (inconsistent with the rest of the app's established pattern) |
| Malformed/oversized filename input | n/a (fixed filename) | Sanitized via regex, silently | Same `sanitizeFilename` reused for templates/scheduled backups |

---

## Redundant export surfaces

Worth stating plainly since it applies identically to all three: each branch
adds a *second* export entry point without removing, reusing, or even
referencing the *first* one that already exists on `app/expenses/page.tsx`
(`lib/csv.ts::downloadCsv`, which is settings-aware and includes an
"Hours of work" column that none of the three new systems reproduce). If any
one of these branches ships as-is, the app will have two different-looking,
differently-columned CSV exports living on two different pages. That's a
product-consistency question, not just a code one, and it's independent of
which version otherwise "wins."

## Summary comparison

| Dimension | v1 | v2 | v3 |
|---|---|---|---|
| Time-to-understand | seconds | ~10–15 min | ~30–45 min |
| Formats | CSV | CSV, JSON, PDF | CSV, JSON, PDF (+ simulated cloud destinations) |
| Filtering | none | date range + category, live preview | template-level presets only (no ad-hoc filter UI) |
| Persistence beyond the download itself | none | none | connections, schedule, and history all persist across sessions |
| New routes | 0 | 0 | 2 (`/export`, `/shared`) |
| Error visibility | n/a | best of the three | good in the UI-facing paths, a real gap in the background/scheduled path |
| Genuinely novel technical idea | — | dynamic-import PDF generation | data-in-URL sharing (works across browsers/sessions with zero backend) |
| Best fit if... | you need "a CSV, now," nothing else | users want control over what/how they export, on demand | the product direction is toward connected/collaborative features, and the team is comfortable owning more surface area (and closing the two error-handling gaps above) before shipping |

None of the three are mutually exclusive at the code level: v2's `lib/export/`
layer is already what v3 is built on, so combining "v2's filtering UI" with
"v3's templates/sharing/scheduling" would mean unifying the two copies of
`lib/export/` (they've already drifted slightly — v3's `filters.ts` adds a
`"year"` preset v2 doesn't have) and deciding whether the drawer or the hub
page is the primary surface, rather than a from-scratch integration.
