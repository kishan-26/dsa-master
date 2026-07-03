import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";
import type { QuestionListItem, QuestionDetail, Pagination } from "@/types/question";

export interface QuestionFilters {
  search?: string;
  difficulty?: string;
  status?: string;
  favorite?: boolean;
  revisionDue?: boolean;
  topic?: string;
  pattern?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

function buildQueryString(filters: QuestionFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== false) {
      params.set(key, String(value));
    }
  });
  return params.toString();
}

export function useQuestions(filters: QuestionFilters) {
  const qs = buildQueryString(filters);
  return useQuery({
    queryKey: ["questions", filters],
    queryFn: () =>
      apiFetch<{ items: QuestionListItem[]; pagination: Pagination }>(`/api/questions?${qs}`),
    placeholderData: (prev) => prev,
  });
}

export function useQuestion(id: string | undefined) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => apiFetch<{ question: QuestionDetail }>(`/api/questions/${id}`).then((r) => r.question),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiFetch<{ question: QuestionDetail }>("/api/questions", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useUpdateQuestion(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      apiFetch<{ question: QuestionDetail }>(`/api/questions/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["question", id], data.question);
      qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useDeleteQuestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/questions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["questions"] }),
  });
}

export function useLogAttempt(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      status: "Failed" | "Solved" | "Gave Up";
      timeTakenMinutes?: number;
      mistakes: string[];
      notes?: string;
    }) =>
      apiFetch<{ question: QuestionDetail }>(`/api/questions/${id}/attempts`, {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["question", id], data.question);
      qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}

export function useLogRevision(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (outcome: "failed" | "struggled" | "confident") =>
      apiFetch<{ question: QuestionDetail }>(`/api/questions/${id}/revisions`, {
        method: "POST",
        body: JSON.stringify({ outcome }),
      }),
    onSuccess: (data) => {
      qc.setQueryData(["question", id], data.question);
      qc.invalidateQueries({ queryKey: ["questions"] });
    },
  });
}
