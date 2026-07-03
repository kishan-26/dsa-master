"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useReviewFlashcard, type FlashcardItem } from "@/hooks/use-flashcards";
import { ApiError } from "@/lib/utils/api-fetch";

export function FlashcardReview({ card, onDone }: { card: FlashcardItem; onDone: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const reviewFlashcard = useReviewFlashcard();

  function handleRate(outcome: "failed" | "struggled" | "confident") {
    reviewFlashcard.mutate(
      { id: card._id, outcome },
      {
        onSuccess: () => {
          toast.success("Reviewed");
          setFlipped(false);
          onDone();
        },
        onError: (err) => toast.error(err instanceof ApiError ? err.message : "Couldn't log review"),
      }
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={() => setFlipped((f) => !f)}
        className="focus-ring flex min-h-[180px] w-full max-w-lg items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm"
        style={{ perspective: 1000 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
            {!flipped && <p className="mt-3 text-xs text-muted-foreground">Tap to reveal</p>}
          </motion.div>
        </AnimatePresence>
      </button>

      {flipped && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleRate("failed")} loading={reviewFlashcard.isPending}>
            Failed
          </Button>
          <Button variant="outline" onClick={() => handleRate("struggled")} loading={reviewFlashcard.isPending}>
            Struggled
          </Button>
          <Button onClick={() => handleRate("confident")} loading={reviewFlashcard.isPending}>
            Confident
          </Button>
        </div>
      )}
    </div>
  );
}
