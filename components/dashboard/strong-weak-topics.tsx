import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface TopicScore {
  id: string;
  name: string;
  slug: string;
  masteryScore: number;
}

export function StrongWeakTopics({ strong, weak }: { strong: TopicScore[]; weak: TopicScore[] }) {
  if (strong.length === 0 && weak.length === 0) {
    return <p className="text-sm text-muted-foreground">Solve a few questions to see your strong and weak topics.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TopicList title="Strongest" icon={<TrendingUp className="h-4 w-4 text-success" />} topics={strong} color="text-success" />
      <TopicList title="Needs work" icon={<TrendingDown className="h-4 w-4 text-warning" />} topics={weak} color="text-warning" />
    </div>
  );
}

function TopicList({
  title,
  icon,
  topics,
  color,
}: {
  title: string;
  icon: React.ReactNode;
  topics: TopicScore[];
  color: string;
}) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        {icon}
        {title}
      </h3>
      <ul className="space-y-1.5">
        {topics.map((t) => (
          <li key={t.id}>
            <Link
              href={`/topics/${t.slug}` as any}
              className="focus-ring flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-secondary/60"
            >
              <span className="truncate">{t.name}</span>
              <span className={cn("font-medium", color)}>{t.masteryScore}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
