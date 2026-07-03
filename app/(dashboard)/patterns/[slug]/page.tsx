"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatternDetail } from "@/hooks/use-taxonomy";
import { GroupStatsGrid } from "@/components/taxonomy/group-stats-grid";
import { MiniQuestionList } from "@/components/taxonomy/mini-question-list";

export default function PatternDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading } = usePatternDetail(params.slug);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const { pattern, questions } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Button variant="ghost" size="sm" onClick={() => router.push("/patterns")} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to patterns
      </Button>

      <h1 className="text-2xl font-bold">{pattern.name}</h1>
      {pattern.description && <p className="mt-1 text-muted-foreground">{pattern.description}</p>}

      <div className="mt-4">
        <GroupStatsGrid
          total={pattern.total}
          solved={pattern.solved}
          revisionDueCount={pattern.revisionDueCount}
          avgTimeTakenMinutes={pattern.avgTimeTakenMinutes}
          avgConfidence={pattern.avgConfidence}
          masteryScore={pattern.masteryScore}
        />
      </div>

      {pattern.weakAreas.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Weak areas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {pattern.weakAreas.map((w) => (
              <Badge key={w.tag} variant="outline" className="border-destructive/40 text-destructive">
                {w.tag} · {w.count}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniQuestionList questions={questions} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
