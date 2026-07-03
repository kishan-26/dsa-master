"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function MistakeFrequencyChart({ data }: { data: { tag: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No mistakes logged yet — nice.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 32)}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="tag"
          width={130}
          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--secondary))" }}
          contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="count" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} isAnimationActive animationDuration={600} />
      </BarChart>
    </ResponsiveContainer>
  );
}
