export type AccentColor = "indigo-violet" | "blue-cyan" | "rose-orange" | "emerald-teal";

interface Palette {
  id: AccentColor;
  label: string;
  from: string; // "H S% L%" - matches --gradient-from format
  to: string;
  primary: string;
}

export const ACCENT_PALETTES: Palette[] = [
  { id: "indigo-violet", label: "Indigo → Violet", from: "243 75% 65%", to: "271 81% 65%", primary: "243 75% 65%" },
  { id: "blue-cyan", label: "Blue → Cyan", from: "217 91% 60%", to: "189 94% 55%", primary: "217 91% 60%" },
  { id: "rose-orange", label: "Rose → Orange", from: "347 77% 60%", to: "24 95% 58%", primary: "347 77% 60%" },
  { id: "emerald-teal", label: "Emerald → Teal", from: "152 69% 45%", to: "173 80% 40%", primary: "152 69% 45%" },
];

export function getPalette(id: AccentColor): Palette {
  return ACCENT_PALETTES.find((p) => p.id === id) ?? ACCENT_PALETTES[0]!;
}

export function applyPalette(id: AccentColor) {
  const palette = getPalette(id);
  const root = document.documentElement.style;
  root.setProperty("--gradient-from", palette.from);
  root.setProperty("--gradient-to", palette.to);
  root.setProperty("--primary", palette.primary);
  root.setProperty("--ring", palette.primary);
}
