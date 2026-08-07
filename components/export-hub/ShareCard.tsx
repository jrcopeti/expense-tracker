"use client";

import { useState } from "react";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fieldClasses } from "@/components/ui/Field";
import { selectExpensesForExport, sumExpenses } from "@/lib/export/filters";
import { totalsByCategory } from "@/lib/expense-utils";
import { resolvePreset, type RangePreset } from "@/lib/export/filters";
import { buildShareUrl, type SharePayload } from "@/lib/share";
import type { Expense } from "@/lib/types";

const SCOPES: Array<{ id: RangePreset; label: string }> = [
  { id: "month", label: "This month" },
  { id: "90d", label: "Last 90 days" },
  { id: "year", label: "This year" },
  { id: "all", label: "All time" },
];

export function ShareCard({ expenses }: { expenses: Expense[] }) {
  const [scope, setScope] = useState<RangePreset>("month");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    try {
      const range = resolvePreset(scope);
      const filtered = selectExpensesForExport(expenses, { ...range, categories: "all" });
      const payload: SharePayload = {
        title: SCOPES.find((s) => s.id === scope)?.label ?? "Expense report",
        from: range.startDate || null,
        to: range.endDate || null,
        count: filtered.length,
        total: sumExpenses(filtered),
        byCategory: totalsByCategory(filtered).map((c) => ({ category: c.category, total: c.total })),
        generatedAt: new Date().toISOString(),
      };
      const url = buildShareUrl(payload);
      setShareUrl(url);
      setCopied(false);

      const QRCode = (await import("qrcode")).default;
      setQrDataUrl(await QRCode.toDataURL(url, { width: 168, margin: 1, color: { dark: "#0b0b0b", light: "#ffffff" } }));
    } catch {
      toast.error("Couldn't generate a share link - please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy - select and copy the link manually.");
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Share2 className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Share a summary</h3>
          <p className="text-xs text-muted">A read-only report link - totals only, no transaction details.</p>
        </div>
      </div>

      <div className="flex gap-2">
        <select value={scope} onChange={(e) => setScope(e.target.value as RangePreset)} className={fieldClasses() + " flex-1"}>
          {SCOPES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <Button onClick={handleGenerate} disabled={isGenerating} variant="secondary">
          {isGenerating ? "Generating..." : "Generate link"}
        </Button>
      </div>

      {shareUrl && (
        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-start">
          {qrDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image adds no value here
            <img src={qrDataUrl} alt="QR code linking to the shared report" className="h-28 w-28 shrink-0 rounded-lg border border-border" />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              <input readOnly value={shareUrl} className={fieldClasses() + " truncate text-xs"} onFocus={(e) => e.target.select()} />
              <Button variant="secondary" size="sm" onClick={handleCopy} aria-label="Copy link">
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </Button>
            </div>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
            >
              Preview report
              <ExternalLink className="h-3 w-3" />
            </a>
            <p className="text-[11px] leading-snug text-muted">
              The report lives entirely inside this link - nothing is uploaded, so it only works if the person you send it to can open this app.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
