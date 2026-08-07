import { Inbox } from "lucide-react";
import { CategoryDot } from "@/components/export/CategoryDot";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

const MAX_PREVIEW_ROWS = 6;

export function PreviewTable({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-8 text-center">
        <Inbox className="h-5 w-5 text-muted" strokeWidth={1.75} />
        <p className="text-xs text-muted">No expenses match these filters.</p>
      </div>
    );
  }

  const visible = expenses.slice(0, MAX_PREVIEW_ROWS);
  const remaining = expenses.length - visible.length;

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-surface-hover text-left text-secondary">
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2 font-medium">Category</th>
            <th className="px-3 py-2 font-medium">Description</th>
            <th className="px-3 py-2 text-right font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((e) => (
            <tr key={e.id} className="border-b border-border last:border-0">
              <td className="whitespace-nowrap px-3 py-2 text-secondary tabular-nums">{formatDate(e.date)}</td>
              <td className="px-3 py-2">
                <span className="flex items-center gap-1.5 text-foreground">
                  <CategoryDot category={e.category} />
                  {e.category}
                </span>
              </td>
              <td className="max-w-[140px] truncate px-3 py-2 text-foreground">{e.description}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-medium tabular-nums text-foreground">
                {formatCurrency(e.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {remaining > 0 && (
        <p className="border-t border-border bg-surface-hover px-3 py-1.5 text-center text-[11px] text-muted">
          + {remaining} more row{remaining === 1 ? "" : "s"} not shown
        </p>
      )}
    </div>
  );
}
