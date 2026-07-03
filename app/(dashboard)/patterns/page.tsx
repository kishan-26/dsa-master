"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitBranch } from "lucide-react";
import { usePatterns } from "@/hooks/use-taxonomy";
import { GroupCard } from "@/components/taxonomy/group-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export default function PatternsPage() {
  const [sort, setSort] = useState<"default" | "neglected">("default");
  const { data: patterns, isLoading } = usePatterns(sort === "neglected" ? "neglected" : undefined);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Patterns</h1>
          <p className="mt-1 text-muted-foreground">Progress and mastery, broken down by pattern.</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-border p-1">
          <Button
            size="sm"
            variant="ghost"
            className={cn(sort === "default" && "bg-secondary")}
            onClick={() => setSort("default")}
          >
            A–Z
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className={cn(sort === "neglected" && "bg-secondary")}
            onClick={() => setSort("neglected")}
          >
            Most neglected
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : patterns && patterns.length > 0 ? (
          patterns.map((p) => (
            <GroupCard
              key={p._id}
              href={`/patterns/${p.slug}`}
              name={p.name}
              total={p.total}
              solved={p.solved}
              masteryScore={p.masteryScore}
              revisionDueCount={p.revisionDueCount}
              avgConfidence={p.avgConfidence}
              lastPracticedAt={p.lastPracticedAt}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <GitBranch className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium">No patterns yet</p>
        <p className="text-sm text-muted-foreground">Tag a question with a pattern (e.g. Sliding Window) to see it here.</p>
      </div>
    </div>
  );
}
