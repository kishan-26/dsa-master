"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface HeatmapDay {
  date: string;
  count: number;
}

const CELL = 11;
const GAP = 3;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function intensityClass(count: number, max: number): string {
  if (count === 0) return "fill-secondary";
  const ratio = count / Math.max(max, 1);
  if (ratio > 0.75) return "fill-primary";
  if (ratio > 0.5) return "fill-primary/70";
  if (ratio > 0.25) return "fill-primary/45";
  return "fill-primary/25";
}

export function Heatmap({ days }: { days: HeatmapDay[] }) {
  const [hovered, setHovered] = useState<HeatmapDay | null>(null);

  const { weeks, max } = useMemo(() => {
    if (days.length === 0) return { weeks: [] as (HeatmapDay | null)[][], max: 0 };

    const first = new Date(days[0]!.date);
    const leadingBlanks = first.getDay(); // 0 = Sunday
    const padded: (HeatmapDay | null)[] = [...Array(leadingBlanks).fill(null), ...days];

    const weeks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      weeks.push(padded.slice(i, i + 7));
    }
    const max = Math.max(...days.map((d) => d.count), 1);
    return { weeks, max };
  }, [days]);

  const width = weeks.length * (CELL + GAP);
  const height = 7 * (CELL + GAP);

  return (
    <div className="overflow-x-auto">
      <div className="relative inline-flex gap-2">
        <div className="flex flex-col justify-between py-1 text-[10px] text-muted-foreground" style={{ height }}>
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        <svg width={width} height={height}>
          {weeks.map((week, wi) =>
            week.map((day, di) =>
              day ? (
                <rect
                  key={`${wi}-${di}`}
                  x={wi * (CELL + GAP)}
                  y={di * (CELL + GAP)}
                  width={CELL}
                  height={CELL}
                  rx={2}
                  className={cn("cursor-pointer transition-opacity hover:opacity-80", intensityClass(day.count, max))}
                  onMouseEnter={() => setHovered(day)}
                  onMouseLeave={() => setHovered(null)}
                />
              ) : null
            )
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {hovered
            ? `${hovered.count} solved on ${new Date(hovered.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
            : "Hover a day for details"}
        </span>
        <div className="flex items-center gap-1">
          <span>Less</span>
          {["fill-secondary", "fill-primary/25", "fill-primary/45", "fill-primary/70", "fill-primary"].map((c) => (
            <svg key={c} width={CELL} height={CELL}>
              <rect width={CELL} height={CELL} rx={2} className={c} />
            </svg>
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
