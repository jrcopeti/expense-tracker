import { FileSpreadsheet, FileJson, FileText } from "lucide-react";
import clsx from "clsx";
import { EXPORT_FORMATS, FORMAT_META, type ExportFormat } from "@/lib/export/types";

const FORMAT_ICONS: Record<ExportFormat, typeof FileText> = {
  csv: FileSpreadsheet,
  json: FileJson,
  pdf: FileText,
};

const FORMAT_BLURBS: Record<ExportFormat, string> = {
  csv: "Opens in Excel, Sheets, Numbers.",
  json: "Structured data, for scripts or backups.",
  pdf: "A formatted report you can print or share.",
};

interface FormatPickerProps {
  value: ExportFormat;
  onChange: (format: ExportFormat) => void;
}

export function FormatPicker({ value, onChange }: FormatPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {EXPORT_FORMATS.map((format) => {
        const Icon = FORMAT_ICONS[format];
        const isSelected = value === format;
        return (
          <button
            key={format}
            type="button"
            onClick={() => onChange(format)}
            aria-pressed={isSelected}
            className={clsx(
              "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-colors",
              isSelected ? "border-accent bg-accent/10" : "border-border bg-surface hover:bg-surface-hover",
            )}
          >
            <Icon className={clsx("h-5 w-5", isSelected ? "text-accent" : "text-muted")} strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-foreground">{FORMAT_META[format].label}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted">{FORMAT_BLURBS[format]}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
