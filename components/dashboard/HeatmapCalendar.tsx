"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/format";
import { formatTimeCost } from "@/lib/time-cost";
import type { DayTotal } from "@/lib/expense-utils";
import type { Settings } from "@/lib/types";
import clsx from "clsx";

interface HeatmapCalendarProps {
  days: DayTotal[]; // oldest first, one entry per calendar day
  settings: Settings;
  onSelectDay?: (date: string) => void;
  selectedDate?: string | null;
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const BUCKET_VARS = ["var(--seq-250)", "var(--seq-350)", "var(--seq-450)", "var(--seq-550)", "var(--seq-600)"];

interface WeekColumn {
  cells: Array<DayTotal | null>; // 7 entries, Mon..Sun, null = out of range padding
  monthLabel: string | null;
}

export function HeatmapCalendar({ days, settings, onSelectDay, selectedDate }: HeatmapCalendarProps) {
  const bucketOf = useMemo(() => buildBucketer(days), [days]);

  const weeks = useMemo(() => buildWeeks(days), [days]);

  const total = days.reduce((sum, d) => sum + d.total, 0);
  const activeDays = days.filter((d) => d.total > 0).length;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Spending rhythm</h3>
          <p className="mt-0.5 text-xs text-muted">
            {activeDays} active day{activeDays === 1 ? "" : "s"} of the last {days.length}, {formatCurrency(total)}{" "}
            total (≈ {formatTimeCost(total, settings)})
          </p>
        </div>
        <Legend />
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="inline-flex gap-[3px]" style={{ minWidth: weeks.length * 15 + 28 }}>
          <div className="flex flex-col gap-[3px] pr-1 pt-[18px]">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="h-[13px] text-[10px] leading-[13px] text-muted">
                {label}
              </div>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                <div className="h-[14px] text-[10px] leading-[14px] text-muted">{week.monthLabel ?? ""}</div>
                {week.cells.map((day, di) => (
                  <DayCell
                    key={di}
                    day={day}
                    bucket={day ? bucketOf(day.total) : -1}
                    settings={settings}
                    isSelected={Boolean(day && selectedDate === day.date)}
                    onSelect={onSelectDay}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function DayCell({
  day,
  bucket,
  settings,
  isSelected,
  onSelect,
}: {
  day: DayTotal | null;
  bucket: number;
  settings: Settings;
  isSelected: boolean;
  onSelect?: (date: string) => void;
}) {
  if (!day) return <div className="h-[13px] w-[13px]" />;

  const color = bucket <= 0 ? "var(--gridline)" : BUCKET_VARS[Math.min(bucket, BUCKET_VARS.length - 1)];

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => onSelect?.(day.date)}
        className={clsx(
          "h-[13px] w-[13px] rounded-[3px] transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none",
          isSelected && "ring-2 ring-accent ring-offset-1 ring-offset-surface",
        )}
        style={{ backgroundColor: color }}
        aria-label={`${formatDate(day.date)}: ${formatCurrency(day.total)}`}
      />
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs shadow-lg group-hover:block group-focus-within:block">
        <p className="font-medium text-secondary">{formatDate(day.date)}</p>
        <p className="font-semibold text-foreground">
          {day.total > 0 ? `${formatCurrency(day.total)} · ${formatTimeCost(day.total, settings)}` : "No spending"}
        </p>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1 text-[10px] text-muted">
      Less
      <span className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: "var(--gridline)" }} />
      {BUCKET_VARS.map((v) => (
        <span key={v} className="h-[11px] w-[11px] rounded-[2px]" style={{ backgroundColor: v }} />
      ))}
      More
    </div>
  );
}

/** 5 quantile-based buckets over the non-zero days in range, so the ramp always spans the actual data. */
function buildBucketer(days: DayTotal[]): (amount: number) => number {
  const nonZero = days.map((d) => d.total).filter((t) => t > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) return () => 0;

  const at = (p: number) => nonZero[Math.min(nonZero.length - 1, Math.floor(p * nonZero.length))];
  const thresholds = [at(0.2), at(0.4), at(0.6), at(0.8)];

  return (amount: number) => {
    if (amount <= 0) return 0;
    let bucket = 1;
    for (const t of thresholds) {
      if (amount > t) bucket += 1;
    }
    return Math.min(bucket, 5);
  };
}

function buildWeeks(days: DayTotal[]): WeekColumn[] {
  if (days.length === 0) return [];

  // Pad the front so the first real day lands in its correct Mon-Sun row.
  const firstDow = mondayIndex(days[0].date);
  const padded: Array<DayTotal | null> = [...Array(firstDow).fill(null), ...days];

  const weeks: WeekColumn[] = [];
  let lastMonth = -1;
  for (let i = 0; i < padded.length; i += 7) {
    const cells = padded.slice(i, i + 7);
    while (cells.length < 7) cells.push(null);

    const firstRealDay = cells.find((c): c is DayTotal => c !== null);
    let monthLabel: string | null = null;
    if (firstRealDay) {
      const month = Number(firstRealDay.date.slice(5, 7)) - 1;
      if (month !== lastMonth) {
        monthLabel = MONTH_NAMES[month];
        lastMonth = month;
      }
    }
    weeks.push({ cells, monthLabel });
  }
  return weeks;
}

function mondayIndex(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  const dow = new Date(y, m - 1, d).getDay(); // 0 = Sun
  return (dow + 6) % 7; // 0 = Mon
}
