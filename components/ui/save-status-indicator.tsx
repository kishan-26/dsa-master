import { Check, Loader2, AlertTriangle } from "lucide-react";
import type { SaveStatus } from "@/hooks/use-autosave";
import { cn } from "@/lib/utils/cn";

export function SaveStatusIndicator({ status, className }: { status: SaveStatus; className?: string }) {
  if (status === "idle") return null;

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" /> Saving…
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-success" /> Saved
        </>
      )}
      {status === "error" && (
        <>
          <AlertTriangle className="h-3 w-3 text-destructive" /> Couldn&apos;t save — retrying
        </>
      )}
    </span>
  );
}
