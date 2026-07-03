"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS: Record<string, string> = {
  Easy: "hsl(var(--easy))",
  Medium: "hsl(var(--medium))",
  Hard: "hsl(var(--hard))",
};

export function DifficultyDonut({ data }: { data: { difficulty: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="difficulty"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={3}
          isAnimationActive
          animationDuration={600}
        >
          {data.map((entry) => (
            <Cell key={entry.difficulty} fill={COLORS[entry.difficulty] ?? "hsl(var(--muted-foreground))"} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
