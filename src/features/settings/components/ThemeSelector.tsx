"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export interface ThemeSelectorProps {
  initialTheme?: "zinc" | "cosmic";
  className?: string;
}

/**
 * Komponent wyboru stylu interfejsu (Zinc Shadcn vs Kosmiczny Modernizm).
 * Zapisuje wybór synchronicznie w ciasteczku sesyjnym oraz localStorage,
 * co zapobiega migotaniu strony przy odświeżaniu (FOUC).
 */
export function ThemeSelector({ initialTheme = "zinc", className }: ThemeSelectorProps) {
  const [theme, setTheme] = useState<"zinc" | "cosmic">(initialTheme);
  const router = useRouter();

  useEffect(() => {
    // Odczyt z localStorage na wypadek braku ciasteczka
    const saved = localStorage.getItem("jobseeker-theme") as "zinc" | "cosmic" | null;
    if (saved && (saved === "zinc" || saved === "cosmic")) {
      setTheme(saved);
    }
  }, []);

  const changeTheme = (newTheme: "zinc" | "cosmic") => {
    setTheme(newTheme);
    localStorage.setItem("jobseeker-theme", newTheme);
    // Ustawienie ciasteczka z roczną ważnością
    document.cookie = `jobseeker-theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;

    // Aktualizacja klasy na znacznikach html i body
    document.body.classList.remove("theme-zinc", "theme-cosmic");
    document.body.classList.add(`theme-${newTheme}`);

    router.refresh();
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Wariant 1: Zinc Technical */}
        <button
          type="button"
          onClick={() => changeTheme("zinc")}
          className={cn(
            "p-4 rounded-xl border text-left transition-all relative",
            theme === "zinc"
              ? "bg-zinc-900 border-yellow-500/70 shadow-[0_0_15px_rgba(234,179,8,0.15)] ring-1 ring-yellow-400"
              : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">1. Zinc Technical (Shadcn)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 font-mono">
              Oryginał
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Klasyczny, stonowany styl dark mode. Zaokrąglone krawędzie, pełne pigułki statusów, standardowe kąty 90°.
          </p>
          {theme === "zinc" && (
            <span className="mt-3 inline-block text-[11px] font-bold text-yellow-400">
              ✓ Aktywny motyw
            </span>
          )}
        </button>

        {/* Wariant 2: Kosmiczny Modernizm */}
        <button
          type="button"
          onClick={() => changeTheme("cosmic")}
          className={cn(
            "p-4 border text-left transition-all relative",
            theme === "cosmic"
              ? "bg-[#09090c] border-yellow-400 shadow-[0_0_24px_rgba(250,204,21,0.25)] ring-1 ring-yellow-400"
              : "bg-[#040406]/60 border-zinc-800 hover:border-yellow-500/40"
          )}
          style={{
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black text-yellow-300 font-mono">✦ 2. Kosmiczny Modernizm (Cyber Void)</span>
            <span className="text-[10px] px-2 py-0.5 font-mono uppercase bg-yellow-400/15 text-yellow-300 border border-yellow-400/40 font-bold">
              Faceted Void
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            Ścięte narożniki pod kątem 45°, trapezowe przyciski bez kątów prostych, głęboka czerń z elektrycznym złotem.
          </p>
          {theme === "cosmic" && (
            <span className="mt-3 inline-block text-[11px] font-bold text-yellow-400 font-mono">
              ✓ Aktywny motyw terminala
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
