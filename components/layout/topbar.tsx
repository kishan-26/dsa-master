"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { apiFetch } from "@/lib/utils/api-fetch";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";

export function Topbar() {
  const { user, clearSession } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    clearSession();
    router.push("/login");
  }

  return (
    <header className="glass sticky top-0 z-20 flex h-16 items-center gap-4 border-b px-6">
      <div className="relative flex-1 max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search questions, topics, patterns…"
          className="focus-ring h-9 w-full rounded-lg border border-input bg-secondary/50 pl-9 pr-3 text-sm placeholder:text-muted-foreground"
        />
      </div>

      <NotificationBell />
      <ThemeToggle />

      <Link href="/profile" className="focus-ring flex items-center gap-2 rounded-full">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient text-sm font-semibold text-white">
          {user?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      </Link>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        Log out
      </Button>
    </header>
  );
}
