import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";

export interface Topic {
  _id: string;
  name: string;
  slug: string;
  color?: string;
  total: number;
  solved: number;
  revisionDueCount: number;
  avgConfidence: number;
  avgTimeTakenMinutes: number | null;
  masteryScore: number;
  lastPracticedAt: string | null;
}

export interface Pattern {
  _id: string;
  name: string;
  slug: string;
  total: number;
  solved: number;
  revisionDueCount: number;
  avgConfidence: number;
  avgTimeTakenMinutes: number | null;
  masteryScore: number;
  lastPracticedAt: string | null;
}

export interface TopicDetail extends Topic {
  description?: string;
  weakAreas: { tag: string; count: number }[];
}

export interface PatternDetail extends Pattern {
  description?: string;
  weakAreas: { tag: string; count: number }[];
}

export interface TaxonomyQuestion {
  _id: string;
  title: string;
  difficulty: string;
  status: string;
  confidence: number;
  nextRevisionDate: string | null;
  leetcodeSlug?: string;
  isFavorite: boolean;
}

export function useTopics(sort?: "neglected") {
  return useQuery({
    queryKey: ["topics", sort ?? "default"],
    queryFn: () =>
      apiFetch<{ topics: Topic[] }>(`/api/topics${sort ? `?sort=${sort}` : ""}`).then((r) => r.topics),
  });
}

export function useTopicDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["topic", slug],
    queryFn: () =>
      apiFetch<{ topic: TopicDetail; questions: TaxonomyQuestion[] }>(`/api/topics/${slug}`),
    enabled: !!slug,
  });
}

export function usePatterns(sort?: "neglected") {
  return useQuery({
    queryKey: ["patterns", sort ?? "default"],
    queryFn: () =>
      apiFetch<{ patterns: Pattern[] }>(`/api/patterns${sort ? `?sort=${sort}` : ""}`).then((r) => r.patterns),
  });
}

export function usePatternDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ["pattern", slug],
    queryFn: () =>
      apiFetch<{ pattern: PatternDetail; questions: TaxonomyQuestion[] }>(`/api/patterns/${slug}`),
    enabled: !!slug,
  });
}

export function useCreateTopic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ topic: Topic }>("/api/topics", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["topics"] }),
  });
}

export function useCreatePattern() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<{ pattern: Pattern }>("/api/patterns", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patterns"] }),
  });
}
