import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";
import type { AchievementResult } from "@/lib/achievements/definitions";
import type { NotificationItem } from "@/app/api/notifications/route";

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: () => apiFetch<{ achievements: AchievementResult[] }>("/api/achievements").then((r) => r.achievements),
  });
}

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<{ notifications: NotificationItem[] }>("/api/notifications").then((r) => r.notifications),
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes while the tab is open
  });
}
