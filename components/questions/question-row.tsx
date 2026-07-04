"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Clock, GitBranch } from "lucide-react";
import { Badge, difficultyVariant } from "@/components/ui/badge";
import { LeetCodeLink } from "./leetcode-link";
import { cn } from "@/lib/utils/cn";
import type { QuestionListItem } from "@/types/question";

const STATUS_VARIANT: Record<string, "default" | "outline" | "accent"> = {
  "Not Started": "outline",
  Attempted: "default",
  Solved: "accent",
  Mastered: "accent",
};

function isDueToday(date: string | null): boolean {
  if (!date) return false;
  return new Date(date).getTime() <= Date.now();
}

export function QuestionRow({ question, onToggleFavorite }: {
  question: QuestionListItem;
  onToggleFavorite: (id: string, next: boolean) => void;
}) {
  const due = isDueToday(question.nextRevisionDate);

  return (
    <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group">
      <Link
        href={`/questions/${question._id}` as any}
        className="focus-ring flex items-center gap-4 rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:scale-[1.01] hover:border-border hover:bg-secondary/40 hover:shadow-md"
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite(question._id, !question.isFavorite);
          }}
          aria-label="Toggle favorite"
          className="focus-ring shrink-0 text-muted-foreground hover:text-medium"
        >
          <Star className={cn("h-4 w-4", question.isFavorite && "fill-medium text-medium")} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{question.title}</span>
            <LeetCodeLink slug={question.leetcodeSlug} />
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <span>{question.topic?.name}</span>
            {question.patterns.length > 0 && (
              <span className="inline-flex items-center gap-1">
                <GitBranch className="h-3 w-3" />
                {question.patterns.map((p) => p.name).join(", ")}
              </span>
            )}
          </div>
        </div>

        <Badge variant={difficultyVariant(question.difficulty)}>{question.difficulty}</Badge>
        <Badge variant={STATUS_VARIANT[question.status]}>{question.status}</Badge>

        <div className="hidden w-24 items-center gap-0.5 sm:flex" title={`Confidence: ${question.confidence}/5`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                i < question.confidence ? "bg-accent-gradient" : "bg-secondary"
              )}
            />
          ))}
        </div>

        {due && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
            <Clock className="h-3 w-3" />
            Due
          </span>
        )}
      </Link>
    </motion.div>
  );
}
