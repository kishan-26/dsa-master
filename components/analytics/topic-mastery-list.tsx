import { cn } from "@/lib/utils/cn";

interface TopicMastery {
  topic: string;
  masteryScore: number;
  solvedQuestions: number;
  totalQuestions: number;
}

export function TopicMasteryList({ data }: { data: TopicMastery[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No topics yet.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((t) => (
        <div key={t.topic}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium">{t.topic}</span>
            <span className="text-muted-foreground">
              {t.solvedQuestions}/{t.totalQuestions} · {t.masteryScore}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn("h-full rounded-full bg-accent-gradient transition-all")}
              style={{ width: `${Math.min(t.masteryScore, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
