"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuestions } from "@/hooks/use-questions";
import { useCreateFlashcard } from "@/hooks/use-flashcards";
import { ApiError } from "@/lib/utils/api-fetch";

export function CreateFlashcardDialog({
  open,
  onClose,
  defaultQuestionId,
  defaultQuestionTitle,
}: {
  open: boolean;
  onClose: () => void;
  defaultQuestionId?: string;
  defaultQuestionTitle?: string;
}) {
  const { data } = useQuestions({ limit: 100, sort: "title" });
  const createFlashcard = useCreateFlashcard();

  const [questionId, setQuestionId] = useState(defaultQuestionId ?? "");
  const [front, setFront] = useState(defaultQuestionTitle ? `How would you approach "${defaultQuestionTitle}"?` : "");
  const [back, setBack] = useState("");

  function reset() {
    setQuestionId(defaultQuestionId ?? "");
    setFront(defaultQuestionTitle ? `How would you approach "${defaultQuestionTitle}"?` : "");
    setBack("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!questionId || !front.trim() || !back.trim()) {
      toast.error("Pick a question and fill in both sides");
      return;
    }
    try {
      await createFlashcard.mutateAsync({ question: questionId, front, back });
      toast.success("Flashcard created");
      reset();
      onClose();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't create flashcard");
    }
  }

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        reset();
      }}
      title="New flashcard"
      description="Turn a question's key insight into a quick recall card."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fc-question">Source question</Label>
          {defaultQuestionId ? (
            <p className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm">
              {defaultQuestionTitle}
            </p>
          ) : (
            <Select id="fc-question" value={questionId} onChange={(e) => setQuestionId(e.target.value)}>
              <option value="">Select a question…</option>
              {data?.items.map((q) => (
                <option key={q._id} value={q._id}>{q.title}</option>
              ))}
            </Select>
          )}
        </div>
        <div>
          <Label htmlFor="fc-front">Front (question/prompt)</Label>
          <Textarea id="fc-front" value={front} onChange={(e) => setFront(e.target.value)} placeholder="What's the time complexity of...?" />
        </div>
        <div>
          <Label htmlFor="fc-back">Back (answer)</Label>
          <Textarea id="fc-back" value={back} onChange={(e) => setBack(e.target.value)} placeholder="O(n log n) because..." />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createFlashcard.isPending}>Create</Button>
        </div>
      </form>
    </Dialog>
  );
}
