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
              ? "bg-zinc-900 border-blue-500 shadow-md ring-1 ring-blue-500"
              : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white">1. Zinc Technical (Shadcn)</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
              Oryginał
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Klasyczny, stonowany styl dark mode. Zaokrąglone krawędzie, pełne pigułki statusów, standardowe kąty 90°.
          </p>
          {theme === "zinc" && (
            <span className="mt-3 inline-block text-[11px] font-bold text-blue-400">
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
              ? "bg-[#0a0e1c] border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.25)] ring-1 ring-indigo-500"
              : "bg-[#04060d]/60 border-zinc-800 hover:border-indigo-500/40"
          )}
          style={{
            clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 font-mono">✦ 2. Kosmiczny Modernizm</span>
            <span className="text-[10px] px-2 py-0.5 font-mono uppercase bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
              Faceted Void
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            Ścięte narożniki pod kątem 45°, trapezowe przyciski bez kątów prostych, czysta typografia i licznik telemetrii HUD CV.
          </p>
          {theme === "cosmic" && (
            <span className="mt-3 inline-block text-[11px] font-bold text-cyan-300 font-mono">
              ✓ Aktywny motyw terminala
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
