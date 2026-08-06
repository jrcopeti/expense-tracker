"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { formatCurrencyCompact, formatCurrency, formatMonthLabel } from "@/lib/format";
import type { MonthlyTotal } from "@/lib/expense-utils";

interface MonthlyTrendChartProps {
  data: MonthlyTotal[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground">Monthly spending trend</h3>
      <p className="mt-0.5 text-xs text-muted">Last {data.length} months</p>

      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="monthlyTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.12} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--gridline)" />
            <XAxis
              dataKey="monthKey"
              tickFormatter={(v: string) => formatMonthLabel(v)}
              axisLine={{ stroke: "var(--baseline)" }}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickFormatter={(v: number) => formatCurrencyCompact(v)}
              width={52}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "var(--baseline)", strokeWidth: 1 }}
              content={<MonthlyTooltip />}
              wrapperStyle={{ outline: "none" }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#monthlyTrendFill)"
              dot={{ r: 4, fill: "var(--accent)", stroke: "var(--surface-1)", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "var(--accent)", stroke: "var(--surface-1)", strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function MonthlyTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthlyTotal }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <p className="text-xs text-secondary">{formatMonthLabel(item.monthKey)}</p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">{formatCurrency(item.total)}</p>
    </div>
  );
}
