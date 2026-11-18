import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { UserNav } from "@/features/auth/components/UserNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#070709] text-zinc-100">
      {/* Pasek nawigacyjny */}
      <header
        className={
          isCosmic
            ? "border-b border-yellow-500/20 bg-[#07070a]/90 backdrop-blur-md sticky top-0 z-40"
            : "border-b border-zinc-800/90 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-40"
        }
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className={
                  isCosmic
                    ? "w-7 h-7 bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-zinc-950 flex items-center justify-center font-black text-xs font-mono shadow-[0_0_14px_rgba(234,179,8,0.35)]"
                    : "w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-500 text-zinc-950 flex items-center justify-center font-black text-xs shadow-[0_0_12px_rgba(234,179,8,0.3)]"
                }
                style={
                  isCosmic
                    ? { clipPath: "polygon(5px 0, 100% 0, calc(100% - 5px) 100%, 0 100%)" }
                    : undefined
                }
              >
                P5
              </div>
              <span className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors tracking-tight">
                Python5 <span className="text-yellow-400">JobSeeker</span>
              </span>
            </Link>
          </div>

          {/* Nawigacja i profil */}
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="flex items-center gap-3 sm:gap-4 text-xs font-mono">
              <Link
                href="/"
                className="text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Oferty
              </Link>
              <Link
                href="/cv"
                className="text-zinc-300 hover:text-yellow-400 transition-colors"
              >
                Twoje CV
              </Link>
              <Link
                href="/settings"
                className={
                  isCosmic
                    ? "px-2.5 py-1 text-[11px] font-bold text-yellow-300 bg-yellow-950/30 border border-yellow-500/40 hover:bg-yellow-900/40 hover:border-yellow-400 transition-all shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                    : "px-2.5 py-1 rounded-md text-[11px] bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-yellow-400 hover:border-yellow-500/40 transition-colors"
                }
              >
                Ustawienia
              </Link>
            </nav>

            <div className="h-4 w-px bg-yellow-500/20 hidden sm:block" />

            <UserNav email={user?.email} isCosmic={isCosmic} />
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {children}
      </main>

      {/* Stopka */}
      <footer className="border-t border-yellow-500/10 py-4 text-center text-zinc-500 text-xs font-mono">
        Jobseeker Hub • Multi-Industry Recruitment Tracker
      </footer>
    </div>
  );
}
