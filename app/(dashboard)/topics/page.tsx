"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { useTopics } from "@/hooks/use-taxonomy";
import { GroupCard } from "@/components/taxonomy/group-card";
import { PremiumEmptyState } from "@/components/ui/premium-empty-state";
import { StaggerContainer, StaggerItem } from "@/components/ui/stagger-list";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export default function TopicsPage() {
  const [sort, setSort] = useState<"default" | "neglected">("default");
  const { data: topics, isLoading } = useTopics(sort === "neglected" ? "neglected" : undefined);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Topics</h1>
          <p className="mt-1 text-muted-foreground">Progress and mastery, broken down by topic.</p>
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

      <StaggerContainer className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
        ) : topics && topics.length > 0 ? (
          topics.map((t) => (
            <StaggerItem key={t._id}>
              <GroupCard
                href={`/topics/${t.slug}`}
                name={t.name}
                total={t.total}
                solved={t.solved}
                masteryScore={t.masteryScore}
                revisionDueCount={t.revisionDueCount}
                avgConfidence={t.avgConfidence}
                lastPracticedAt={t.lastPracticedAt}
              />
            </StaggerItem>
          ))
        ) : (
          <EmptyState />
        )}
      </StaggerContainer>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full">
      <PremiumEmptyState
        icon={Layers}
        title="No topics yet"
        description="Topics are created automatically when you add a question — go add your first one."
      />
    </div>
  );
}
