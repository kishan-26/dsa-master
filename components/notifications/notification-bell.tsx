"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Clock, Target, AlertTriangle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications-achievements";
import { cn } from "@/lib/utils/cn";
import type { NotificationItem } from "@/app/api/notifications/route";

const ICONS: Record<NotificationItem["type"], React.ComponentType<{ className?: string }>> = {
  revision_due: Clock,
  daily_goal: Target,
  missed_goal: AlertTriangle,
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications } = useNotifications();
  const count = notifications?.length ?? 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-notification-bell]")) setOpen(false);
    }
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" data-notification-bell>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="focus-ring relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="glass absolute right-0 top-11 z-30 w-80 rounded-xl border p-2 shadow-xl"
          >
            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Notifications</p>
            {notifications && notifications.length > 0 ? (
              <ul className="space-y-1">
                {notifications.map((n) => {
                  const Icon = ICONS[n.type];
                  return (
                    <li
                      key={n.id}
                      className={cn(
                        "flex items-start gap-2 rounded-lg px-2 py-2 text-sm",
                        n.severity === "warning" ? "text-warning" : "text-foreground"
                      )}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{n.message}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
