import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-accent-gradient p-12 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 text-2xl font-bold text-white">DSA Master</div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-tight text-white">
            Your personal operating system for cracking coding interviews.
          </h2>
          <p className="mt-4 text-white/80">
            Adaptive spaced repetition, mistake tracking, and analytics that actually tell you
            what to study next.
          </p>
        </div>
        <div className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} DSA Master
        </div>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
