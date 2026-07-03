"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Check, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "@/components/theme/theme-provider";
import { ACCENT_PALETTES, type AccentColor } from "@/lib/theme/accent-palettes";
import { apiFetch, ApiError } from "@/lib/utils/api-fetch";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const { theme, accent, setAccent } = useTheme();
  const [exporting, setExporting] = useState(false);

  async function handleAccentChange(id: AccentColor) {
    setAccent(id);
    try {
      await apiFetch("/api/profile", { method: "PATCH", body: JSON.stringify({ accentColor: id }) });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't save accent preference");
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/settings/export", { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dsa-master-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch {
      toast.error("Couldn't export your data");
    } finally {
      setExporting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Appearance, data, and account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Currently: {theme === "dark" ? "Dark" : "Light"} mode</CardDescription>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accent color</CardTitle>
          <CardDescription>Applies to buttons, charts, and progress rings across the app.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ACCENT_PALETTES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAccentChange(p.id)}
                className={cn(
                  "focus-ring flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors",
                  accent === p.id ? "border-primary" : "border-border hover:border-primary/40"
                )}
              >
                <div
                  className="relative h-10 w-full rounded-lg"
                  style={{ background: `linear-gradient(135deg, hsl(${p.from}) 0%, hsl(${p.to}) 100%)` }}
                >
                  {accent === p.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{p.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export your data</CardTitle>
          <CardDescription>Download everything — questions, attempts, flashcards, and more — as JSON.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleExport} loading={exporting}>
            <Download className="h-4 w-4" />
            Export as JSON
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile &amp; account</CardTitle>
          <CardDescription>Name, password, sessions, and account deletion live on your profile page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => (window.location.href = "/profile")}>
            Go to profile
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
