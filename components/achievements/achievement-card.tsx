"use client";

import { motion } from "framer-motion";
import { Trophy, Flame, Brain, GitBranch, Network, Layers, Lock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { AchievementResult } from "@/lib/achievements/definitions";

const ICONS: Record<AchievementResult["icon"], React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  flame: Flame,
  brain: Brain,
  "git-branch": GitBranch,
  network: Network,
  layers: Layers,
};

export function AchievementCard({ achievement, index }: { achievement: AchievementResult; index: number }) {
  const Icon = ICONS[achievement.icon];
  const pct = Math.round((achievement.current / achievement.target) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border p-5 transition-colors",
        achievement.unlocked ? "border-primary/40 bg-accent-gradient-soft" : "border-border bg-card"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            achievement.unlocked ? "bg-accent-gradient text-white" : "bg-secondary text-muted-foreground"
          )}
        >
          {achievement.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
        </div>
        {achievement.unlocked && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2, type: "spring", bounce: 0.5 }}
            className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
          >
            Unlocked
          </motion.span>
        )}
      </div>

      <h3 className="mt-3 font-semibold">{achievement.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{achievement.description}</p>

      {!achievement.unlocked && (
        <div className="mt-3">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="h-full rounded-full bg-accent-gradient"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {achievement.current}/{achievement.target}
          </p>
        </div>
      )}
    </motion.div>
  );
}
