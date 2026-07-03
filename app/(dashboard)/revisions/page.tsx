"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PartyPopper, AlertCircle, Clock } from "lucide-react";
import { useDueQuestions, isOverdue } from "@/hooks/use-due-questions";
import { DueQuestionCard } from "@/components/revisions/due-question-card";
import { DueQuestionsSkeleton } from "@/components/revisions/due-questions-skeleton";

export default function RevisionsPage() {
  const { data, isLoading } = useDueQuestions();

  const items = data?.items ?? [];
  const overdue = items.filter((q) => isOverdue(q.nextRevisionDate));
  const dueToday = items.filter((q) => !isOverdue(q.nextRevisionDate));

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div>
        <h1 className="text-2xl font-bold">Due Today</h1>
        <p className="mt-1 text-muted-foreground">
          {isLoading
            ? "Loading your revision queue…"
            : items.length === 0
            ? "Nothing due — you're all caught up."
            : `${items.length} question${items.length === 1 ? "" : "s"} to revise, pulled from every question where the next revision date has arrived.`}
        </p>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <DueQuestionsSkeleton />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            {overdue.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Overdue ({overdue.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {overdue.map((q) => (
                      <DueQuestionCard key={q._id} question={q} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {dueToday.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  Due today ({dueToday.length})
                </h2>
                <div className="space-y-3">
                  <AnimatePresence>
                    {dueToday.map((q) => (
                      <DueQuestionCard key={q._id} question={q} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15">
        <PartyPopper className="h-5 w-5 text-success" />
      </div>
      <div>
        <p className="font-medium">All caught up</p>
        <p className="text-sm text-muted-foreground">No revisions are due right now. Come back tomorrow.</p>
      </div>
    </div>
  );
}
