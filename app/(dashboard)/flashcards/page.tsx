"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Plus, Trash2, Layers3, PartyPopper } from "lucide-react";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlashcards, useDeleteFlashcard } from "@/hooks/use-flashcards";
import { CreateFlashcardDialog } from "@/components/flashcards/create-flashcard-dialog";
import { FlashcardReview } from "@/components/flashcards/flashcard-review";
import { ApiError } from "@/lib/utils/api-fetch";

export default function FlashcardsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const { data: dueCards, isLoading: dueLoading } = useFlashcards(true);
  const { data: allCards, isLoading: allLoading } = useFlashcards(false);
  const deleteFlashcard = useDeleteFlashcard();

  const currentDue = dueCards?.[reviewIndex];

  async function handleDelete(id: string) {
    if (!confirm("Delete this flashcard?")) return;
    try {
      await deleteFlashcard.mutateAsync(id);
      toast.success("Flashcard deleted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't delete");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Flashcards</h1>
          <p className="mt-1 text-muted-foreground">Quick recall cards, reviewed on the same spaced-repetition engine.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New flashcard
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Due for review {dueCards && dueCards.length > 0 ? `(${dueCards.length})` : ""}</CardTitle>
        </CardHeader>
        <CardContent>
          {dueLoading ? (
            <Skeleton className="h-44 w-full rounded-2xl" />
          ) : currentDue ? (
            <FlashcardReview
              key={currentDue._id}
              card={currentDue}
              onDone={() => setReviewIndex((i) => i)}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <PartyPopper className="h-6 w-6 text-success" />
              <p className="text-sm text-muted-foreground">No flashcards due right now.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>All flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          {allLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : allCards && allCards.length > 0 ? (
            <div className="divide-y divide-border">
              {allCards.map((c) => (
                <div key={c._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.front}</p>
                    {c.topic && <p className="text-xs text-muted-foreground">{c.topic.name}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(c._id)}
                    aria-label="Delete flashcard"
                    className="focus-ring rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <PremiumEmptyState
              icon={Layers3}
              title="No flashcards yet"
              description="Create one from any question — the fastest way is the 'Make flashcard' button on a question's detail page."
              actionLabel="New flashcard"
              onAction={() => setDialogOpen(true)}
            />
          )}
        </CardContent>
      </Card>

      <CreateFlashcardDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </motion.div>
  );
}
