import { cn } from "@/lib/utils/cn";

export function PlannerProgressBar({
  label,
  current,
  goal,
  unit,
}: {
  label: string;
  current: number;
  goal: number;
  unit?: string;
}) {
  const pct = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  const met = current >= goal && goal > 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className={cn("text-muted-foreground", met && "font-medium text-success")}>
          {current}/{goal} {unit}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", met ? "bg-success" : "bg-accent-gradient")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
