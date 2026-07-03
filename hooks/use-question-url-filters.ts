"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { QuestionFilters } from "./use-questions";

export function useQuestionUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters: QuestionFilters = useMemo(
    () => ({
      search: searchParams.get("search") ?? undefined,
      difficulty: searchParams.get("difficulty") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      favorite: searchParams.get("favorite") === "true",
      revisionDue: searchParams.get("revisionDue") === "true",
      topic: searchParams.get("topic") ?? undefined,
      pattern: searchParams.get("pattern") ?? undefined,
      page: Number(searchParams.get("page") ?? 1),
      sort: searchParams.get("sort") ?? "newest",
    }),
    [searchParams]
  );

  const setFilters = useCallback(
    (next: QuestionFilters) => {
      const params = new URLSearchParams();
      Object.entries(next).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== false) {
          params.set(key, String(value));
        }
      });
      router.replace(`${pathname}?${params.toString()}` as any, { scroll: false });
    },
    [router, pathname]
  );

  return [filters, setFilters] as const;
}
