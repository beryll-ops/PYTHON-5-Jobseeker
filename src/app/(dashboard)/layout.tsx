import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Pasek nawigacyjny */}
      <header
        className={
          isCosmic
            ? "border-b border-indigo-500/20 bg-[#060914]/80 backdrop-blur-md sticky top-0 z-40"
            : "border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40"
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div
                className={
                  isCosmic
                    ? "w-7 h-7 bg-indigo-600 flex items-center justify-center font-bold text-white text-xs font-mono"
                    : "w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs"
                }
                style={
                  isCosmic
                    ? { clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)" }
                    : undefined
                }
              >
                P5
              </div>
              <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                Python5 JobSeeker
              </span>
            </Link>
          </div>

          {/* Nawigacja */}
          <nav className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
            <Link
              href="/"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Oferty
            </Link>
            <Link
              href="/cv"
              className="text-zinc-300 hover:text-white transition-colors"
            >
              Twoje CV
            </Link>
            <Link
              href="/settings"
              className={
                isCosmic
                  ? "px-2.5 py-1 text-[11px] font-bold text-cyan-300 bg-indigo-950/60 border border-indigo-500/30 hover:bg-indigo-900/60 transition-colors"
                  : "px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white transition-colors"
              }
            >
              Ustawienia
            </Link>
          </nav>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Stopka */}
      <footer className="border-t border-white/5 py-4 text-center text-zinc-600 text-xs font-mono">
        Jobseeker Hub • Multi-Industry Recruitment Tracker
      </footer>
    </div>
  );
}
