import { Flame } from "lucide-react";
import clsx from "clsx";

export function StreakBadge({ streak, dailyBudget }: { streak: number; dailyBudget: number | null }) {
  if (dailyBudget === null) return null;

  const isActive = streak > 0;
  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-xl border px-4 py-3",
        isActive ? "border-warning/30 bg-warning/10" : "border-border bg-surface-hover",
      )}
      title={`Consecutive days at or under your ${dailyBudget ? `$${dailyBudget}` : ""} daily budget`}
    >
      <Flame className={clsx("h-5 w-5", isActive ? "text-warning" : "text-muted")} strokeWidth={2} fill={isActive ? "currentColor" : "none"} />
      <div>
        <p className="text-sm font-semibold text-foreground">
          {streak} day{streak === 1 ? "" : "s"}
        </p>
        <p className="text-xs text-muted">under budget</p>
      </div>
    </div>
  );
}
