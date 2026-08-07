"use client";

import { useState } from "react";
import { Mail, Info, Inbox } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { TemplateCard } from "@/components/export-hub/TemplateCard";
import { ConnectionCard } from "@/components/export-hub/ConnectionCard";
import { EmailExportModal } from "@/components/export-hub/EmailExportModal";
import { ScheduleCard } from "@/components/export-hub/ScheduleCard";
import { ShareCard } from "@/components/export-hub/ShareCard";
import { HistoryTable } from "@/components/export-hub/HistoryTable";
import { useExpenses } from "@/hooks/useExpenses";
import { CONNECTION_IDS } from "@/lib/integrations/types";
import { EXPORT_TEMPLATES } from "@/lib/export-templates";

export default function ExportHubPage() {
  const { expenses, isLoading } = useExpenses();
  const [isEmailOpen, setIsEmailOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <Skeleton className="h-10 w-64" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Export &amp; integrations</h1>
        <span className="flex items-center gap-1.5 rounded-full bg-surface-hover px-2.5 py-1 text-[11px] font-medium text-muted">
          <Info className="h-3 w-3" />
          Demo — connections are simulated, nothing leaves your browser
        </span>
      </div>
      <p className="mt-1 text-sm text-secondary">
        Templates, cloud sync, scheduled backups, and sharing - all in one place.
      </p>

      {expenses.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Inbox} title="Nothing to export yet" description="Log a few expenses first, then come back here." />
        </div>
      ) : (
        <>
          <section className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Templates</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {EXPORT_TEMPLATES.map((template) => (
                <TemplateCard key={template.id} template={template} expenses={expenses} />
              ))}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Connected apps</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CONNECTION_IDS.map((id) => (
                <ConnectionCard key={id} id={id} />
              ))}
              <Card className="flex flex-col gap-3 p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-hover text-foreground">
                  <Mail className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Email</h3>
                  <p className="mt-1 text-xs leading-relaxed text-secondary">Send a one-off export as an attachment.</p>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setIsEmailOpen(true)} className="mt-1">
                  Compose
                </Button>
              </Card>
            </div>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ScheduleCard />
            <ShareCard expenses={expenses} />
          </section>

          <section className="mt-8">
            <HistoryTable />
          </section>
        </>
      )}

      {isEmailOpen && <EmailExportModal expenses={expenses} onClose={() => setIsEmailOpen(false)} />}
    </div>
  );
}
