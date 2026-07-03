"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function TopicBarChart({ data }: { data: { topic: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions yet.</p>;
  }

  const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 32)}>
      <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="topic"
          width={110}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--secondary))" }}
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  );
}
