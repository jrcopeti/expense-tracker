import clsx from "clsx";
import { fieldClasses } from "@/components/ui/Field";
import { resolvePreset, RANGE_PRESETS, type RangePreset } from "@/lib/export/filters";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onPreset: (preset: RangePreset) => void;
  onStartDate: (date: string) => void;
  onEndDate: (date: string) => void;
}

export function DateRangeFilter({ startDate, endDate, onPreset, onStartDate, onEndDate }: DateRangeFilterProps) {
  const activePreset = RANGE_PRESETS.find((p) => {
    const resolved = resolvePreset(p.id);
    return resolved.startDate === startDate && resolved.endDate === endDate;
  });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {RANGE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPreset(preset.id)}
            className={clsx(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              activePreset?.id === preset.id
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface text-secondary hover:bg-surface-hover hover:text-foreground",
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="export-start" className="text-xs font-medium text-secondary">
            From
          </label>
          <input
            id="export-start"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => onStartDate(e.target.value)}
            className={fieldClasses()}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="export-end" className="text-xs font-medium text-secondary">
            To
          </label>
          <input
            id="export-end"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onEndDate(e.target.value)}
            className={fieldClasses()}
          />
        </div>
      </div>
    </div>
  );
}
