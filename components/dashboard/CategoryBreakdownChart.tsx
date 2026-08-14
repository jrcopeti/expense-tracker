"use client";

import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import type { CategoryTotal } from "@/lib/expense-utils";
import { PieChart } from "lucide-react";

interface CategoryBreakdownChartProps {
  data: CategoryTotal[];
}

export function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-foreground">Spending by category</h3>
      <p className="mt-0.5 text-xs text-muted">All-time totals, highest first</p>

      {data.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={PieChart}
            title="No data yet"
            description="Category totals will show up here once you add expenses."
          />
        </div>
      ) : (
        <div className="mt-3" style={{ height: Math.max(data.length * 42, 130) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 64, left: 4, bottom: 4 }}
              barCategoryGap="30%"
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="category"
                width={108}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "var(--text-secondary)", fontSize: 13 }}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-hover)" }}
                content={<CategoryTooltip />}
                wrapperStyle={{ outline: "none" }}
              />
              <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                {data.map((entry) => (
                  <Cell key={entry.category} fill={CATEGORY_META[entry.category].cssVar} />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  offset={8}
                  formatter={(value: unknown) => formatCurrency(value as number)}
                  fill="var(--text-secondary)"
                  fontSize={12}
                  fontWeight={500}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

function CategoryTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryTotal }>;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const meta = CATEGORY_META[item.category];

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-3.5 rounded-sm"
          style={{ backgroundColor: meta.cssVar }}
          aria-hidden
        />
        <span className="text-xs text-secondary">{item.category}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(item.total)}</p>
      <p className="text-xs text-muted">
        {item.percent.toFixed(0)}% of total · {item.count} transaction{item.count === 1 ? "" : "s"}
      </p>
    </div>
  );
}
