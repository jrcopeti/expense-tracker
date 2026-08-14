import Link from "next/link";
import { ArrowRight, Receipt } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

export function RecentExpenses({ expenses }: { expenses: Expense[] }) {
  const recent = expenses.slice(0, 5);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Recent expenses</h3>
        <Link
          href="/expenses"
          className="flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
        >
          View all
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {recent.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon={Receipt} title="Nothing yet" description="Your latest expenses will show up here." />
        </div>
      ) : (
        <ul className="mt-3 flex flex-col divide-y divide-border">
          {recent.map((expense) => (
            <li key={expense.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <CategoryBadge category={expense.category} size="sm" />
                <div>
                  <p className="text-sm font-medium text-foreground">{expense.description}</p>
                  <p className="text-xs text-muted">{formatDate(expense.date)}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                {formatCurrency(expense.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
