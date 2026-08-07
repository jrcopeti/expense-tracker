import type { ExportPayload } from "../types";
import { sumExpenses } from "../filters";
import { formatCurrency, formatDate } from "@/lib/format";

const ACCENT_RGB: [number, number, number] = [163, 98, 15]; // --accent (light mode hex #a3620f)

function describeFilters(payload: ExportPayload): string {
  const { startDate, endDate, categories } = payload.filters;
  const range =
    startDate || endDate
      ? `${startDate ? formatDate(startDate) : "the start"} – ${endDate ? formatDate(endDate) : "today"}`
      : "All dates";
  const cats = categories === "all" ? "All categories" : categories.join(", ");
  return `${range} · ${cats}`;
}

/**
 * jsPDF + autotable are dynamically imported here, not at module top-level -
 * CSV/JSON exports never pay for this ~200KB dependency; it only loads when
 * someone actually picks PDF.
 */
export async function buildPdfBlob(payload: ExportPayload): Promise<Blob> {
  const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 40;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(payload.reportTitle ?? "Expense Report", marginX, 48);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110, 110, 110);
  doc.text(`Generated ${payload.generatedAt.toLocaleString()}`, marginX, 66);
  doc.text(describeFilters(payload), marginX, 80);

  const total = sumExpenses(payload.expenses);

  autoTable(doc, {
    startY: 100,
    margin: { left: marginX, right: marginX },
    head: [["Date", "Category", "Description", "Amount"]],
    body: payload.expenses.map((e) => [formatDate(e.date), e.category, e.description, formatCurrency(e.amount)]),
    foot: [["", "", "Total", formatCurrency(total)]],
    headStyles: { fillColor: ACCENT_RGB, textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [245, 245, 243], textColor: [20, 20, 20], fontStyle: "bold" },
    columnStyles: { 3: { halign: "right" } },
    styles: { fontSize: 9, cellPadding: 6 },
    alternateRowStyles: { fillColor: [250, 250, 249] },
    didDrawPage: () => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Hourglass · ${payload.expenses.length} expense${payload.expenses.length === 1 ? "" : "s"}`,
        marginX,
        doc.internal.pageSize.getHeight() - 20,
      );
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() - marginX - 60,
        doc.internal.pageSize.getHeight() - 20,
      );
    },
  });

  return doc.output("blob");
}
