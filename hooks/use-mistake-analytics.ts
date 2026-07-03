import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";

export interface MistakeAnalytics {
  total: number;
  mostCommon: { tag: string; count: number }[];
  trend: { date: string; count: number }[];
}

export function useMistakeAnalytics(filters: { topic?: string; pattern?: string }) {
  const params = new URLSearchParams();
  if (filters.topic) params.set("topic", filters.topic);
  if (filters.pattern) params.set("pattern", filters.pattern);

  return useQuery({
    queryKey: ["analytics", "mistakes", filters],
    queryFn: () => apiFetch<MistakeAnalytics>(`/api/analytics/mistakes?${params.toString()}`),
  });
}
