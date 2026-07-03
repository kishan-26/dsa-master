import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "focus-ring flex min-h-[80px] w-full rounded-lg border border-input bg-secondary/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
