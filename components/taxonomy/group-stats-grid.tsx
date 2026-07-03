import { Card, CardContent } from "@/components/ui/card";

interface GroupStatsGridProps {
  total: number;
  solved: number;
  revisionDueCount: number;
  avgTimeTakenMinutes: number | null;
  avgConfidence: number;
  masteryScore: number;
}

export function GroupStatsGrid({
  total,
  solved,
  revisionDueCount,
  avgTimeTakenMinutes,
  avgConfidence,
  masteryScore,
}: GroupStatsGridProps) {
  const progressPct = total > 0 ? Math.round((solved / total) * 100) : 0;
  const remaining = total - solved;

  const stats = [
    { label: "Progress", value: `${progressPct}%` },
    { label: "Solved / Remaining", value: `${solved} / ${remaining}` },
    { label: "Revision due", value: String(revisionDueCount) },
    { label: "Avg. solve time", value: avgTimeTakenMinutes != null ? `${avgTimeTakenMinutes} min` : "—" },
    { label: "Avg. confidence", value: `${avgConfidence.toFixed(1)}/5` },
    { label: "Mastery score", value: `${masteryScore}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-lg font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
