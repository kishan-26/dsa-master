import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";

export interface FlashcardItem {
  _id: string;
  question: string;
  front: string;
  back: string;
  topic?: { _id: string; name: string; slug: string };
  easeFactor: number;
  intervalDays: number;
  nextRevisionDate: string | null;
  createdAt: string;
}

export function useFlashcards(due = false) {
  return useQuery({
    queryKey: ["flashcards", { due }],
    queryFn: () =>
      apiFetch<{ flashcards: FlashcardItem[] }>(`/api/flashcards${due ? "?due=true" : ""}`).then(
        (r) => r.flashcards
      ),
  });
}

export function useCreateFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { question: string; front: string; back: string }) =>
      apiFetch<{ flashcard: FlashcardItem }>("/api/flashcards", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }),
  });
}

export function useDeleteFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/flashcards/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }),
  });
}

export function useReviewFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome }: { id: string; outcome: "failed" | "struggled" | "confident" }) =>
      apiFetch<{ flashcard: FlashcardItem }>(`/api/flashcards/${id}/revisions`, {
        method: "POST",
        body: JSON.stringify({ outcome }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["flashcards"] }),
  });
}
