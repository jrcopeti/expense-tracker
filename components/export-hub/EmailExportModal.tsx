"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { X, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Portal } from "@/components/ui/Portal";
import { Button } from "@/components/ui/Button";
import { Field, fieldClasses } from "@/components/ui/Field";
import { useExportHistory } from "@/hooks/useExportHistory";
import { selectExpensesForExport, sumExpenses } from "@/lib/export/filters";
import { EXPORT_FORMATS, FORMAT_META, type ExportFormat } from "@/lib/export/types";
import type { Expense } from "@/lib/types";

interface EmailExportModalProps {
  expenses: Expense[];
  onClose: () => void;
}

export function EmailExportModal({ expenses, onClose }: EmailExportModalProps) {
  const { logExport } = useExportHistory();
  const titleId = useId();
  const [to, setTo] = useState("");
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [message, setMessage] = useState("Here's my latest expense export from Hourglass.");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "sending") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, status]);

  const allExpenses = selectExpensesForExport(expenses, { startDate: "", endDate: "", categories: "all" });

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!to.includes("@")) return;
    setStatus("sending");
    // Simulated - this demo never sends a real email or contacts a mail server.
    await new Promise((resolve) => setTimeout(resolve, 900));
    logExport({
      format,
      templateLabel: "Email export",
      destination: `Emailed to ${to} (demo)`,
      count: allExpenses.length,
      total: sumExpenses(allExpenses),
    });
    setStatus("sent");
    toast.success(`Simulated email to ${to} - nothing was actually sent`);
  }

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
          onClick={status === "sending" ? undefined : onClose}
          aria-hidden
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl"
        >
          <div className="mb-1 flex items-center justify-between">
            <h2 id={titleId} className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-4.5 w-4.5 text-accent" />
              Email export
            </h2>
            <button
              type="button"
              onClick={onClose}
              disabled={status === "sending"}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary hover:bg-surface-hover hover:text-foreground disabled:opacity-40"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
          <p className="mb-5 text-sm text-secondary">
            Demo mode: this simulates sending an email. No message actually leaves your browser.
          </p>

          {status === "sent" ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
                <Mail className="h-5.5 w-5.5" />
              </span>
              <p className="text-sm font-medium text-foreground">Sent to {to} (simulated)</p>
              <Button variant="secondary" size="sm" onClick={onClose} className="mt-3">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSend} className="flex flex-col gap-4">
              <Field label="To" htmlFor="email-to">
                <input
                  id="email-to"
                  type="email"
                  required
                  autoFocus
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="accountant@example.com"
                  className={fieldClasses()}
                />
              </Field>

              <Field label="Format" htmlFor="email-format">
                <select
                  id="email-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ExportFormat)}
                  className={fieldClasses()}
                >
                  {EXPORT_FORMATS.map((f) => (
                    <option key={f} value={f}>
                      {FORMAT_META[f].label} attachment
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Message" htmlFor="email-message">
                <textarea
                  id="email-message"
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={fieldClasses()}
                />
              </Field>

              <p className="text-xs text-muted">
                {allExpenses.length} expense{allExpenses.length === 1 ? "" : "s"} will be attached.
              </p>

              <div className="mt-1 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send"
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Portal>
  );
}
