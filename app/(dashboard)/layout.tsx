"use client";

import type { ReactNode } from "react";
import { AuthInitializer } from "@/components/auth/auth-initializer";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PageTransition } from "@/components/ui/page-transition";
import { useBrowserNotificationWatcher } from "@/hooks/use-browser-notification-watcher";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  useBrowserNotificationWatcher();

  return (
    <AuthInitializer>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </AuthInitializer>
  );
}
