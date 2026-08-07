"use client";

import Link from "next/link";
import { Hourglass, Link2 as LinkIcon, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { CategoryDot } from "@/components/expenses/CategoryDot";
import { useLocationHash } from "@/hooks/useLocationHash";
import { useIsClient } from "@/hooks/useIsClient";
import { decodeSharePayload } from "@/lib/share";
import { formatCurrency, formatDate } from "@/lib/format";

export default function SharedReportPage() {
  const isClient = useIsClient();
  const hash = useLocationHash();

  if (!isClient) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  const payload = decodeSharePayload(hash);

  if (!payload) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <EmptyState
          icon={LinkIcon}
          title="This link looks broken"
          description="The report data couldn't be read from this URL. Ask whoever sent it for a fresh link."
        />
      </div>
    );
  }

  const grandTotal = payload.total || 1;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-16">
      <div className="mb-6 flex items-center gap-2 text-sm font-medium text-secondary">
        <Hourglass className="h-4 w-4" />
        Shared via Hourglass
      </div>

      <Card className="p-6 sm:p-8">
        <p className="text-sm font-medium text-secondary">{payload.title}</p>
        <p className="mt-1 text-xs text-muted">
          {payload.from ? formatDate(payload.from) : "All time"} – {payload.to ? formatDate(payload.to) : "today"}
        </p>

        <p className="mt-5 text-5xl font-semibold tracking-tight text-foreground">{formatCurrency(payload.total)}</p>
        <p className="mt-1.5 text-sm text-muted">
          across {payload.count} expense{payload.count === 1 ? "" : "s"}
        </p>

        {payload.byCategory.length > 0 && (
          <div className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
            {payload.byCategory.map((row) => (
              <div key={row.category} className="flex items-center gap-3">
                <span className="flex w-28 shrink-0 items-center gap-1.5 text-xs font-medium text-secondary">
                  <CategoryDot category={row.category} />
                  {row.category}
                </span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(3, (row.total / grandTotal) * 100)}%` }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-xs font-medium tabular-nums text-foreground">
                  {formatCurrency(row.total)}
                </span>
              </div>
            ))}
          </div>
        )}

        <p className="mt-6 border-t border-border pt-4 text-[11px] text-muted">
          Generated {new Date(payload.generatedAt).toLocaleString()}. This is a read-only summary - no individual
          transactions are included, and nothing was uploaded to create this link.
        </p>
      </Card>

      <Link
        href="/"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-accent hover:underline"
      >
        Track your own spending with Hourglass
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
