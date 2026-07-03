import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/utils/api-fetch";

export interface DashboardData {
  dailyGoal: { questions: number; revisions: number; studyMinutes: number };
  solvedToday: number;
  revisionDueCount: number;
  totalSolved: number;
  currentStreak: number;
  weeklyTrend: { date: string; count: number }[];
  heatmap: { date: string; count: number }[];
  strongTopics: { id: string; name: string; slug: string; masteryScore: number }[];
  weakTopics: { id: string; name: string; slug: string; masteryScore: number }[];
}

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => apiFetch<DashboardData>("/api/analytics/dashboard"),
  });
}

export interface OverviewData {
  questionsPerTopic: { topic: string; count: number }[];
  difficultyDistribution: { difficulty: string; count: number }[];
  dailySolvedTrend: { date: string; count: number }[];
  avgSolveTimeMinutes: number | null;
  revisionCompletionRate: number | null;
  confidenceOverTime: { date: string; avgEase: number }[];
  topicMastery: { topic: string; masteryScore: number; solvedQuestions: number; totalQuestions: number }[];
  consistencyPct: number;
}

export function useOverviewAnalytics() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => apiFetch<OverviewData>("/api/analytics/overview"),
  });
}

export interface CalendarDay {
  date: string;
  solved: number;
  revisions: number;
}

export function useCalendarMonth(month: string) {
  return useQuery({
    queryKey: ["analytics", "calendar", month],
    queryFn: () => apiFetch<{ days: CalendarDay[] }>(`/api/analytics/calendar?month=${month}`).then((r) => r.days),
  });
}
