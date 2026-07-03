import { useQuestions } from "./use-questions";

export function useDueQuestions() {
  return useQuestions({ revisionDue: true, sort: "revisionDue", limit: 100 });
}

export function isOverdue(nextRevisionDate: string | null): boolean {
  if (!nextRevisionDate) return false;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return new Date(nextRevisionDate).getTime() < startOfToday.getTime();
}
