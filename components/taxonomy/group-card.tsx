import Link from "next/link";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface GroupCardProps {
  href: string;
  name: string;
  total: number;
  solved: number;
  masteryScore: number;
  revisionDueCount: number;
  avgConfidence: number;
  lastPracticedAt: string | null;
}

function masteryColor(score: number): string {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warning";
  return "text-destructive";
}

export function GroupCard({
  href,
  name,
  total,
  solved,
  masteryScore,
  revisionDueCount,
  avgConfidence,
  lastPracticedAt,
}: GroupCardProps) {
  const progressPct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <Link
      href={href as any}
      className="focus-ring block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-semibold">{name}</h3>
        <span className={cn("text-sm font-bold", masteryColor(masteryScore))}>{masteryScore}%</span>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>{solved}/{total} solved</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-accent-gradient" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {revisionDueCount > 0 && (
          <Badge variant="outline" className="border-warning/40 text-warning">
            <Clock className="h-3 w-3" />
            {revisionDueCount} due
          </Badge>
        )}
        <span>Confidence {avgConfidence.toFixed(1)}/5</span>
        {lastPracticedAt && (
          <span>· Last practiced {new Date(lastPracticedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        )}
      </div>
    </Link>
  );
}
