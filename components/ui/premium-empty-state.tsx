"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function PremiumEmptyState({ icon: Icon, title, description, actionLabel, onAction }: PremiumEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center"
    >
      <motion.div
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gradient-soft glow-primary"
      >
        <Icon className="h-7 w-7 text-primary" />
      </motion.div>
      <div>
        <p className="text-lg font-semibold">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
