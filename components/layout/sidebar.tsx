"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";
import { NAV_ITEMS } from "@/lib/utils/nav-items";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="glass sticky top-0 hidden h-screen w-64 flex-col border-r p-4 lg:flex"
    >
      <div className="flex items-center gap-2 px-2 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-gradient glow-primary">
          <Code2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold">DSA Master</span>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as any}
              className={cn(
                "focus-ring relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:text-foreground",
                isActive && "text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent-gradient-soft glow-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
