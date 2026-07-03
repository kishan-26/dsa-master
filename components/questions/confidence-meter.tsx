"use client";

import { cn } from "@/lib/utils/cn";

export function ConfidenceMeter({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const level = i + 1;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            aria-label={`Confidence ${level} of 5`}
            className={cn(
              "focus-ring h-2.5 w-7 rounded-full transition-colors",
              level <= value ? "bg-accent-gradient" : "bg-secondary hover:bg-secondary/80"
            )}
          />
        );
      })}
      <span className="ml-1.5 text-xs text-muted-foreground">{value}/5</span>
    </div>
  );
}
