"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

const PUBLIC_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, isInitializing, setSession, clearSession, setInitializing } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
        if (cancelled) return;

        if (res.ok) {
          const data = await res.json();
          setSession(data.user, data.accessToken);
        } else {
          clearSession();
          if (!PUBLIC_PATHS.includes(pathname)) router.replace("/login");
        }
      } catch {
        if (!cancelled) {
          clearSession();
          if (!PUBLIC_PATHS.includes(pathname)) router.replace("/login");
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
