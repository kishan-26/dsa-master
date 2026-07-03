import Link from "next/link";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { LeetCodeLink } from "@/components/questions/leetcode-link";
import type { TaxonomyQuestion } from "@/hooks/use-taxonomy";

export function MiniQuestionList({ questions }: { questions: TaxonomyQuestion[] }) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions here yet.</p>;
  }

  return (
    <div className="divide-y divide-border">
      {questions.map((q) => (
        <Link
          key={q._id}
          href={`/questions/${q._id}` as any}
          className="focus-ring flex items-center gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{q.title}</span>
          <LeetCodeLink slug={q.leetcodeSlug} />
          <Badge variant={difficultyVariant(q.difficulty)}>{q.difficulty}</Badge>
          <Badge variant="outline">{q.status}</Badge>
        </Link>
      ))}
    </div>
  );
}
