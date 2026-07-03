import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { QueryProvider } from "@/components/theme/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "DSA Master — Your Personal DSA Learning OS",
  description:
    "Track questions, run adaptive spaced repetition, and master coding interview patterns with DSA Master.",
};

// Prevents a flash of the wrong theme/accent before hydration.
const themeInitScript = `
(function() {
  try {
    var stored = window.localStorage.getItem('dsa-master-theme');
    var theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');

    var accents = {
      'indigo-violet': { from: '243 75% 65%', to: '271 81% 65%', primary: '243 75% 65%' },
      'blue-cyan': { from: '217 91% 60%', to: '189 94% 55%', primary: '217 91% 60%' },
      'rose-orange': { from: '347 77% 60%', to: '24 95% 58%', primary: '347 77% 60%' },
      'emerald-teal': { from: '152 69% 45%', to: '173 80% 40%', primary: '152 69% 45%' }
    };
    var accent = window.localStorage.getItem('dsa-master-accent');
    var palette = accents[accent];
    if (palette) {
      var root = document.documentElement.style;
      root.setProperty('--gradient-from', palette.from);
      root.setProperty('--gradient-to', palette.to);
      root.setProperty('--primary', palette.primary);
      root.setProperty('--ring', palette.primary);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast: "bg-card border border-border text-foreground",
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
