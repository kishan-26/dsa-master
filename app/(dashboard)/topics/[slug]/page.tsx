"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopicDetail } from "@/hooks/use-taxonomy";
import { GroupStatsGrid } from "@/components/taxonomy/group-stats-grid";
import { MiniQuestionList } from "@/components/taxonomy/mini-question-list";

export default function TopicDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { data, isLoading } = useTopicDetail(params.slug);

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const { topic, questions } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Button variant="ghost" size="sm" onClick={() => router.push("/topics")} className="mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to topics
      </Button>

      <h1 className="text-2xl font-bold">{topic.name}</h1>
      {topic.description && <p className="mt-1 text-muted-foreground">{topic.description}</p>}

      <div className="mt-4">
        <GroupStatsGrid
          total={topic.total}
          solved={topic.solved}
          revisionDueCount={topic.revisionDueCount}
          avgTimeTakenMinutes={topic.avgTimeTakenMinutes}
          avgConfidence={topic.avgConfidence}
          masteryScore={topic.masteryScore}
        />
      </div>

      {topic.weakAreas.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Weak areas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {topic.weakAreas.map((w) => (
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
