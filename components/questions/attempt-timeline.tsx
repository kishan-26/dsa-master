import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AttemptEntry } from "@/types/question";

const STATUS_ICON = {
  Solved: <CheckCircle2 className="h-4 w-4 text-success" />,
  Failed: <XCircle className="h-4 w-4 text-destructive" />,
  "Gave Up": <MinusCircle className="h-4 w-4 text-muted-foreground" />,
};

export function AttemptTimeline({ attempts }: { attempts: AttemptEntry[] }) {
  if (attempts.length === 0) {
    return <p className="text-sm text-muted-foreground">No attempts logged yet.</p>;
  }

  const sorted = [...attempts].sort(
    (a, b) => new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
  );

  return (
    <ol className="space-y-3">
      {sorted.map((attempt) => (
        <li key={attempt._id} className="flex items-start gap-3 rounded-lg border border-border p-3">
          <div className="mt-0.5">{STATUS_ICON[attempt.status]}</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{attempt.status}</span>
              <span className="text-muted-foreground">
                {new Date(attempt.attemptedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {attempt.timeTakenMinutes != null && (
                <span className="text-muted-foreground">· {attempt.timeTakenMinutes} min</span>
              )}
            </div>
            {attempt.mistakes.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {attempt.mistakes.map((m) => (
                  <Badge key={m} variant="outline">{m}</Badge>
                ))}
              </div>
            )}
            {attempt.notes && <p className="mt-1.5 text-sm text-muted-foreground">{attempt.notes}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
