"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type AccentColor, applyPalette } from "@/lib/theme/accent-palettes";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  accent: AccentColor;
  setAccent: (a: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "dsa-master-theme";
const ACCENT_STORAGE_KEY = "dsa-master-accent";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Dark is the product default per design direction.
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<AccentColor>("indigo-violet");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial = stored ?? "dark";
    setThemeState(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");

    const storedAccent = window.localStorage.getItem(ACCENT_STORAGE_KEY) as AccentColor | null;
    if (storedAccent) {
      setAccentState(storedAccent);
      applyPalette(storedAccent);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    window.localStorage.setItem(STORAGE_KEY, t);
    document.documentElement.classList.toggle("dark", t === "dark");
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const setAccent = (a: AccentColor) => {
    setAccentState(a);
    window.localStorage.setItem(ACCENT_STORAGE_KEY, a);
    applyPalette(a);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
