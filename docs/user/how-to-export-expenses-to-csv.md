# How to export your expenses to CSV

Download whatever expenses you're currently looking at as a spreadsheet
file you can open in Excel, Numbers, or Google Sheets.

## Steps

1. Go to the **Expenses** page and, if you want, narrow the list first using
   the search box, category, date range, or sort options in the filter bar —
   the export only includes what's currently shown.

   <!-- SCREENSHOT: Expenses page with the filter bar visible above the expense table -->

2. Click **Export CSV** in the top-right corner of the page.

   <!-- SCREENSHOT: Expenses page header with the "Export CSV" button highlighted -->

3. A file named `hourglass-expenses-YYYY-MM-DD.csv` downloads to your
   browser's downloads folder, and a confirmation toast appears in the
   bottom-right corner ("Exported N expenses to CSV").

   <!-- SCREENSHOT: Success toast reading "Exported 12 expenses to CSV" -->

4. Open the file in any spreadsheet app. Each row has: **Date**,
   **Category**, **Description**, **Amount**, and **Hours of work** — how
   long that expense cost you at your configured hourly rate. The Hours
   column is blank for every row until you set an hourly rate or income in
   **Settings**.

## If nothing downloads

If you see a toast saying *"Nothing to export with the current filters"*,
your filters are hiding every expense — clear or loosen them (the **Clear
filters** button in the filter bar resets them in one click) and try again.

## Technical details

See [CSV export — implementation](../dev/csv-export-implementation.md) for
how the file is built.

## Related guides

- [`README.md` — Manually testing everything](../../README.md#manually-testing-everything)
  walks through export alongside the rest of the Expenses page.
