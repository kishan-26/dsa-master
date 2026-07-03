"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCalendarMonth } from "@/hooks/use-analytics";
import { cn } from "@/lib/utils/cn";

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function LearningCalendar() {
  const [cursor, setCursor] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { data: days, isLoading } = useCalendarMonth(monthKey(cursor));

  const firstOfMonth = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const leadingBlanks = firstOfMonth.getDay();
  const dayMap = new Map((days ?? []).map((d) => [d.date, d]));
  const selected = selectedDate ? dayMap.get(selectedDate) : null;

  function changeMonth(delta: number) {
    setSelectedDate(null);
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">
          {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </h3>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-lg" />
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-1.5 grid grid-cols-7 gap-1.5">
            {Array.from({ length: leadingBlanks }).map((_, i) => (
              <div key={`blank-${i}`} />
            ))}
            {(days ?? []).map((d) => {
              const dayNum = Number(d.date.slice(-2));
              const isSelected = d.date === selectedDate;
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(isSelected ? null : d.date)}
                  className={cn(
                    "focus-ring flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors",
                    d.solved > 0 ? "bg-accent-gradient-soft text-primary font-medium" : "text-muted-foreground hover:bg-secondary",
                    isSelected && "ring-2 ring-primary"
                  )}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden rounded-lg border border-border p-3 text-sm"
              >
                <p className="font-medium">
                  {new Date(selected.date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                </p>
                <p className="mt-1 text-muted-foreground">
                  {selected.solved} solved · {selected.revisions} revision{selected.revisions === 1 ? "" : "s"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
