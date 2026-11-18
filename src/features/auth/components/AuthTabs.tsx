"use client";

import React from "react";
import type { AuthMode } from "@/features/auth/types";
import { cn } from "@/lib/utils";

export interface AuthTabsProps {
  mode: AuthMode;
  onSelectMode: (mode: AuthMode) => void;
}

/**
 * Pasek wyboru metody logowania: Hasło lub Magic Link.
 * Aktywne zakładki wyróżnione dynamicznym żółto-czarnym akcentem.
 */
export function AuthTabs({ mode, onSelectMode }: AuthTabsProps) {
  const tabs: Array<{ id: AuthMode; label: string }> = [
    { id: "signin", label: "Hasło" },
    { id: "magic-link", label: "Magic Link" },
  ];

  return (
    <div className="flex border-b border-zinc-800 text-xs font-mono">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelectMode(tab.id)}
          className={cn(
            "flex-1 py-2 text-center transition-all border-b-2",
            mode === tab.id
              ? "border-yellow-400 text-yellow-400 font-bold shadow-[0_2px_10px_rgba(250,204,21,0.2)]"
              : "border-transparent text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
