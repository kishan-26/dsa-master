"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function WeeklyTrendChart({ data }: { data: { date: string; count: number }[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="weekly-bar-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: "hsl(var(--gradient-from))" }} />
            <stop offset="100%" style={{ stopColor: "hsl(var(--gradient-to))" }} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <Tooltip
          cursor={{ fill: "hsl(var(--secondary))" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" name="Solved" fill="url(#weekly-bar-gradient)" radius={[4, 4, 0, 0]} isAnimationActive animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  );
}
