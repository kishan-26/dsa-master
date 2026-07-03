"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeetCodeLink } from "@/components/questions/leetcode-link";
import { useLogRevision } from "@/hooks/use-questions";
import { isOverdue } from "@/hooks/use-due-questions";
import { ApiError } from "@/lib/utils/api-fetch";
import type { QuestionListItem } from "@/types/question";

export function DueQuestionCard({ question }: { question: QuestionListItem }) {
  const logRevision = useLogRevision(question._id);
  const overdue = isOverdue(question.nextRevisionDate);

  function handleLog(outcome: "failed" | "struggled" | "confident") {
    logRevision.mutate(outcome, {
      onSuccess: () => toast.success("Revision logged"),
      onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't log revision"),
    });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="min-w-0 flex-1">
        <Link href={`/questions/${question._id}` as any} className="focus-ring inline-flex items-center gap-2 font-medium hover:underline">
          {question.title}
          <LeetCodeLink slug={question.leetcodeSlug} />
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <Badge variant={difficultyVariant(question.difficulty)}>{question.difficulty}</Badge>
          <Badge variant="outline">{question.topic?.name}</Badge>
          {overdue && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
              <AlertCircle className="h-3 w-3" />
              Overdue
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => handleLog("failed")} loading={logRevision.isPending}>
          Failed
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleLog("struggled")} loading={logRevision.isPending}>
          Struggled
        </Button>
        <Button size="sm" onClick={() => handleLog("confident")} loading={logRevision.isPending}>
          Confident
        </Button>
      </div>
    </motion.div>
  );
}
