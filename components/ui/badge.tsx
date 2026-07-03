import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        easy: "bg-easy/15 text-easy",
        medium: "bg-medium/15 text-medium",
        hard: "bg-hard/15 text-hard",
        outline: "border border-border text-muted-foreground",
        accent: "bg-accent-gradient-soft text-primary",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function difficultyVariant(difficulty: string): "easy" | "medium" | "hard" {
  if (difficulty === "Easy") return "easy";
  if (difficulty === "Medium") return "medium";
  return "hard";
}
