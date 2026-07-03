"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function DailyTrendChart({ data }: { data: { date: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No solved questions in the last 90 days yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "hsl(var(--gradient-from))" }} stopOpacity={0.4} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--gradient-to))" }} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
          minTickGap={30}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip
          labelFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Solved"
          stroke="hsl(var(--gradient-from))"
          fill="url(#trend-fill)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={700}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
