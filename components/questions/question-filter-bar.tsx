"use client";

import { Star, Clock } from "lucide-react";
import { DIFFICULTIES, QUESTION_STATUSES } from "@/lib/constants/question";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useTopics, usePatterns } from "@/hooks/use-taxonomy";
import type { QuestionFilters } from "@/hooks/use-questions";
import { cn } from "@/lib/utils/cn";

interface FilterBarProps {
  filters: QuestionFilters;
  onChange: (next: QuestionFilters) => void;
}

export function QuestionFilterBar({ filters, onChange }: FilterBarProps) {
  const { data: topics } = useTopics();
  const { data: patterns } = usePatterns();

  const hasActiveFilters =
    filters.difficulty || filters.status || filters.favorite || filters.revisionDue || filters.topic || filters.pattern;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.difficulty ?? ""}
        onChange={(e) => onChange({ ...filters, difficulty: e.target.value || undefined, page: 1 })}
        className="w-auto min-w-[130px]"
      >
        <option value="">All difficulty</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </Select>

      <Select
        value={filters.status ?? ""}
        onChange={(e) => onChange({ ...filters, status: e.target.value || undefined, page: 1 })}
        className="w-auto min-w-[140px]"
      >
        <option value="">All statuses</option>
        {QUESTION_STATUSES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </Select>

      <Select
        value={filters.topic ?? ""}
        onChange={(e) => onChange({ ...filters, topic: e.target.value || undefined, page: 1 })}
        className="w-auto min-w-[140px]"
      >
        <option value="">All topics</option>
        {topics?.map((t) => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </Select>

      <Select
        value={filters.pattern ?? ""}
        onChange={(e) => onChange({ ...filters, pattern: e.target.value || undefined, page: 1 })}
        className="w-auto min-w-[140px]"
      >
        <option value="">All patterns</option>
        {patterns?.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </Select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange({ ...filters, favorite: !filters.favorite, page: 1 })}
        className={cn(filters.favorite && "border-primary text-primary")}
      >
        <Star className={cn("h-3.5 w-3.5", filters.favorite && "fill-primary")} />
        Favorites
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange({ ...filters, revisionDue: !filters.revisionDue, page: 1 })}
        className={cn(filters.revisionDue && "border-primary text-primary")}
      >
        <Clock className="h-3.5 w-3.5" />
        Due today
      </Button>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              search: filters.search,
              sort: filters.sort,
              page: 1,
            })
          }
        >
          Clear filters
        </Button>
      )}
    </div>
  );
}
