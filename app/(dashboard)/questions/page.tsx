"use client";

import { Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Inbox, Target } from "lucide-react";
import { toast } from "sonner";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { Button } from "@/components/ui/button";
import { QuestionSearchBar } from "@/components/questions/question-search-bar";
import { QuestionFilterBar } from "@/components/questions/question-filter-bar";
import { QuestionRow } from "@/components/questions/question-row";
import { QuestionListSkeleton } from "@/components/questions/question-list-skeleton";
import { NewQuestionDialog } from "@/components/questions/new-question-dialog";
import { useQuestions, useUpdateQuestion } from "@/hooks/use-questions";
import { useQuestionUrlFilters } from "@/hooks/use-question-url-filters";
import { useDebounce } from "@/hooks/use-debounce";
import { ApiError } from "@/lib/utils/api-fetch";

export default function QuestionsPage() {
  return (
    <Suspense fallback={<QuestionListSkeleton />}>
      <QuestionsPageContent />
    </Suspense>
  );
}

function QuestionsPageContent() {
  const [filters, setFilters] = useQuestionUrlFilters();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debouncedSearch = useDebounce(searchInput, 250);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (debouncedSearch !== (filters.search ?? "")) {
      setFilters({ ...filters, search: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const { data, isLoading, isFetching } = useQuestions(filters);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Questions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data ? `${data.pagination.total} question${data.pagination.total === 1 ? "" : "s"}` : "Loading…"}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add question
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuestionSearchBar value={searchInput} onChange={setSearchInput} />
        <QuestionFilterBar filters={filters} onChange={setFilters} />
      </div>

      <div className={data && data.items.length === 0 && !isLoading ? "mt-6" : "mt-6 rounded-2xl border border-border bg-card"}>
        {isLoading ? (
          <QuestionListSkeleton />
        ) : data && data.items.length > 0 ? (
          <QuestionListBody items={data.items} isFetching={isFetching} />
        ) : filters.search || filters.difficulty || filters.status || filters.favorite || filters.revisionDue || filters.topic || filters.pattern ? (
          <PremiumEmptyState
            icon={Inbox}
            title="No questions match your filters"
            description="Try clearing a filter, or add a new question to your tracker."
            actionLabel="Add question"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <PremiumEmptyState
            icon={Target}
            title="Start your DSA journey"
            description="You haven't added any questions yet. Add your first one and start building your streak."
            actionLabel="Add your first question"
            onAction={() => setDialogOpen(true)}
          />
        )}
      </div>

      {data && data.pagination.pages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.pagination.pages}
            onClick={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
          >
            Next
          </Button>
        </div>
      )}

      <NewQuestionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </motion.div>
  );
}

function QuestionListBody({ items, isFetching }: { items: any[]; isFetching: boolean }) {
  return (
    <div className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <div className="divide-y divide-border">
        {items.map((q) => (
          <QuestionRowWithFavorite key={q._id} question={q} />
        ))}
      </div>
    </div>
  );
}

function QuestionRowWithFavorite({ question }: { question: any }) {
  const updateQuestion = useUpdateQuestion(question._id);

  return (
    <QuestionRow
      question={question}
      onToggleFavorite={(id, next) => {
        updateQuestion.mutate(
          { isFavorite: next },
          {
            onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't update"),
          }
        );
      }}
    />
  );
}


