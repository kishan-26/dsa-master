import { Skeleton } from "@/components/ui/skeleton";

export function QuestionRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl px-4 py-3">
      <Skeleton className="h-4 w-4 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="hidden h-1.5 w-24 sm:block" />
    </div>
  );
}

export function QuestionListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <QuestionRowSkeleton key={i} />
      ))}
    </div>
  );
}
