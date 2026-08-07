import type { ReactNode } from "react";
import clsx from "clsx";

type Tone = "success" | "neutral" | "warning";

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success-text",
  neutral: "bg-surface-hover text-muted",
  warning: "bg-warning/15 text-warning",
};

export function StatusChip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", TONE_CLASSES[tone])}>
      <span
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          tone === "success" && "bg-success",
          tone === "neutral" && "bg-muted",
          tone === "warning" && "bg-warning",
        )}
        aria-hidden
      />
      {children}
    </span>
  );
}
