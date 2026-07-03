import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";

export interface PlannerData {
  goal: { questions: number; revisions: number; studyMinutes: number };
  progress: { questions: number; revisions: number; studyMinutes: number };
}

export function usePlanner() {
  return useQuery({
    queryKey: ["planner"],
    queryFn: () => apiFetch<PlannerData>("/api/planner"),
  });
}

export function useUpdatePlannerGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: PlannerData["goal"]) =>
      apiFetch<{ goal: PlannerData["goal"] }>("/api/planner", {
        method: "PATCH",
        body: JSON.stringify(goal),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["planner"] }),
  });
}
