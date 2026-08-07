"use client";

import { CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { fieldClasses } from "@/components/ui/Field";
import { useSchedule } from "@/hooks/useSchedule";
import { useConnections } from "@/hooks/useConnections";
import type { ScheduleFrequency, ScheduleDestination } from "@/lib/integrations/scheduleStore";
import { EXPORT_FORMATS, FORMAT_META, type ExportFormat } from "@/lib/export/types";
import { CONNECTION_META } from "@/lib/integrations/types";
import { formatRelativeTime } from "@/lib/format";

const FREQUENCIES: Array<{ id: ScheduleFrequency; label: string }> = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
];

export function ScheduleCard() {
  const { schedule, updateSchedule } = useSchedule();
  const { connections } = useConnections();

  const connectedDestinations = (Object.keys(connections) as Array<keyof typeof connections>).filter(
    (id) => connections[id].status === "connected",
  );

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <CalendarClock className="h-4.5 w-4.5" strokeWidth={1.75} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Automatic backups</h3>
            <p className="text-xs text-muted">Runs the next time you open Hourglass, if it&rsquo;s due.</p>
          </div>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={schedule.enabled}
            onChange={(e) => updateSchedule({ enabled: e.target.checked })}
            className="peer sr-only"
          />
          <span className="h-6 w-11 rounded-full bg-surface-hover transition-colors peer-checked:bg-accent" />
          <span className="absolute left-1 h-4 w-4 rounded-full bg-surface shadow transition-transform peer-checked:translate-x-5" />
        </label>
      </div>

      {schedule.enabled && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="schedule-frequency" className="text-xs font-medium text-secondary">
                Frequency
              </label>
              <select
                id="schedule-frequency"
                value={schedule.frequency}
                onChange={(e) => updateSchedule({ frequency: e.target.value as ScheduleFrequency })}
                className={fieldClasses()}
              >
                {FREQUENCIES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="schedule-format" className="text-xs font-medium text-secondary">
                Format
              </label>
              <select
                id="schedule-format"
                value={schedule.format}
                onChange={(e) => updateSchedule({ format: e.target.value as ExportFormat })}
                className={fieldClasses()}
              >
                {EXPORT_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {FORMAT_META[f].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="schedule-destination" className="text-xs font-medium text-secondary">
              Destination
            </label>
            <select
              id="schedule-destination"
              value={schedule.destination}
              onChange={(e) => updateSchedule({ destination: e.target.value as ScheduleDestination })}
              className={fieldClasses()}
            >
              <option value="download">Download to this device</option>
              {connectedDestinations.map((id) => (
                <option key={id} value={id}>
                  {CONNECTION_META[id].name} (demo)
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-lg bg-surface-hover px-3 py-2.5 text-xs text-secondary">
            {schedule.nextRunAt && (
              <p>
                Next backup <span className="font-medium text-foreground">{formatRelativeTime(schedule.nextRunAt)}</span>
              </p>
            )}
            {schedule.lastRunAt && (
              <p className="mt-0.5 text-muted">Last ran {formatRelativeTime(schedule.lastRunAt)}</p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
