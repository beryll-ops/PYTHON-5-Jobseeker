import React from "react";
import { cookies } from "next/headers";
import { ThemeSelector } from "@/features/settings/components/ThemeSelector";

export default async function SettingsPage() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("jobseeker-theme")?.value as "zinc" | "cosmic") || "zinc";
  const isCosmic = theme === "cosmic";

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "https://placeholder-project.supabase.co"
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Nagłówek */}
      <div>
        <span className="text-[11px] font-mono text-yellow-400 font-bold uppercase">
          // KONFIGURACJA_SYSTEMU
        </span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
          Ustawienia Aplikacji
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5 font-mono">
          Dostosuj preferencje wizualne interfejsu oraz zweryfikuj połączenie z bazą danych.
        </p>
      </div>

      {/* Sekcja 1: Wybór Stylu UI */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-3">
        <h2 className="text-sm font-bold text-white font-mono uppercase">
          Wybór Stylu Interfejsu (Design System)
        </h2>
        <p className="text-xs text-zinc-400">
          Wybierz preferowany styl. Ustawienie zapisywane jest w pamięci przeglądarki i ciasteczku sesyjnym.
        </p>
        <ThemeSelector initialTheme={theme} />
      </section>

      {/* Sekcja 2: Status Połączenia z Supabase */}
      <section className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl space-y-3 font-mono text-xs">
        <h2 className="text-sm font-bold text-white uppercase">
          Status Integracji z Supabase
        </h2>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded">
            <span className="text-zinc-400">NEXT_PUBLIC_SUPABASE_URL:</span>
            <span className={supabaseConfigured ? "text-emerald-400 font-bold" : "text-amber-400"}>
              {supabaseConfigured ? "Podłączono ✓" : "Wartość domyślna (wymaga konfiguracji)"}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-black/40 border border-white/5 rounded">
            <span className="text-zinc-400">Supabase Storage Bucket:</span>
            <span className="text-cyan-400 font-bold">resumes</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 bg-black/20 p-3 rounded border border-white/5 space-y-1">
          <span className="font-bold text-zinc-300 block">Jak podłączyć własną bazę:</span>
          <p>1. Skopiuj plik <code className="text-cyan-300">.env.example</code> do <code className="text-cyan-300">.env.local</code>.</p>
          <p>2. Wprowadź swój Project URL i Anon Key z panelu Supabase.</p>
          <p>3. Uruchom skrypt SQL DDL z pliku dokumentacji bazy danych.</p>
        </div>
      </section>
    </div>
  );
}
