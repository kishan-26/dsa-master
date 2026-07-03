import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { RevisionEntry } from "@/types/question";
import { cn } from "@/lib/utils/cn";

const OUTCOME_STYLE: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  confident: { icon: <TrendingUp className="h-4 w-4" />, label: "Confident", color: "text-success" },
  struggled: { icon: <Minus className="h-4 w-4" />, label: "Struggled", color: "text-warning" },
  failed: { icon: <TrendingDown className="h-4 w-4" />, label: "Failed", color: "text-destructive" },
};

export function RevisionTimeline({ revisions }: { revisions: RevisionEntry[] }) {
  if (revisions.length === 0) {
    return <p className="text-sm text-muted-foreground">No revisions logged yet.</p>;
  }

  const sorted = [...revisions].sort(
    (a, b) => new Date(b.revisedAt).getTime() - new Date(a.revisedAt).getTime()
  );

  return (
    <ol className="space-y-3">
      {sorted.map((rev) => {
        const style = OUTCOME_STYLE[rev.outcome] ?? OUTCOME_STYLE.failed!;
        return (
          <li key={rev._id} className="flex items-start gap-3 rounded-lg border border-border p-3">
            <div className={cn("mt-0.5", style.color)}>{style.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{style.label}</span>
                <span className="text-muted-foreground">
                  {new Date(rev.revisedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Interval {rev.intervalDaysBefore}d → {rev.intervalDaysAfter}d · Ease {rev.easeFactorBefore.toFixed(2)} → {rev.easeFactorAfter.toFixed(2)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
