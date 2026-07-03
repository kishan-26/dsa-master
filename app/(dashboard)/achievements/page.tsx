"use client";

import { motion } from "framer-motion";
import { useAchievements } from "@/hooks/use-notifications-achievements";
import { AchievementCard } from "@/components/achievements/achievement-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AchievementsPage() {
  const { data: achievements, isLoading } = useAchievements();
  const unlockedCount = achievements?.filter((a) => a.unlocked).length ?? 0;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <h1 className="text-2xl font-bold">Achievements</h1>
      <p className="mt-1 text-muted-foreground">
        {isLoading ? "Loading…" : `${unlockedCount} of ${achievements?.length ?? 0} unlocked`}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)
          : achievements?.map((a, i) => <AchievementCard key={a.id} achievement={a} index={i} />)}
      </div>
    </motion.div>
  );
}
