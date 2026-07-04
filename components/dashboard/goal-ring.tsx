"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function GoalRing({
  value,
  goal,
  label,
  size = 120,
}: {
  value: number;
  goal: number;
  label: string;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = goal > 0 ? Math.min(value / goal, 1) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="goal-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "hsl(var(--gradient-from))" }} />
              <stop offset="100%" style={{ stopColor: "hsl(var(--gradient-to))" }} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#goal-ring-gradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold"><AnimatedCounter value={value} /></span>
          <span className="text-xs text-muted-foreground">/ {goal}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
