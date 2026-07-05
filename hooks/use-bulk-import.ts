import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";
import type { CuratedQuestion } from "@/lib/data/curated-questions";

export function useBulkImportQuestions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: CuratedQuestion[]) =>
      apiFetch<{ created: number; skipped: number }>("/api/questions/bulk-import", {
        method: "POST",
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["questions"] });
      qc.invalidateQueries({ queryKey: ["topics"] });
      qc.invalidateQueries({ queryKey: ["patterns"] });
    },
  });
}
