import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  delta?: { value: string; direction: "up" | "down"; isGood: boolean };
}

export function StatCard({ label, value, icon: Icon, hint, delta }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-secondary">{label}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {(hint || delta) && (
        <p className="flex items-center gap-1.5 text-xs text-muted">
          {delta && (
            <span className={clsx("font-medium", delta.isGood ? "text-success-text" : "text-danger")}>
              {delta.direction === "up" ? "↑" : "↓"} {delta.value}
            </span>
          )}
          {hint}
        </p>
      )}
    </Card>
  );
}
