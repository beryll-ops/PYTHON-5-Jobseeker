"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

export interface UserNavProps {
  email?: string | null;
  isCosmic?: boolean;
}

/**
 * Komponent profilu użytkownika w nagłówku nawigacji.
 * Zapewnia status sesji oraz przycisk wylogowania w palecie ciemnego obsydianu i złota.
 */
export function UserNav({ email, isCosmic = false }: UserNavProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  if (!email) {
    return (
      <Link
        href="/login"
        className={cn(
          "px-3 py-1 font-mono text-xs font-semibold transition-all",
          isCosmic
            ? "text-yellow-400 hover:text-yellow-300 border border-yellow-500/40 bg-yellow-950/30 shadow-[0_0_10px_rgba(234,179,8,0.15)]"
            : "text-zinc-200 hover:text-yellow-400 border border-zinc-700 bg-zinc-800 rounded"
        )}
      >
        Zaloguj się
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2.5 text-xs font-mono">
      <div className="flex items-center text-zinc-300 hidden md:flex truncate max-w-[160px]">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block mr-1.5 shadow-[0_0_6px_rgba(250,204,21,0.8)]" />
        <span className="truncate">{email}</span>
      </div>
      <button
        type="button"
        disabled={isPending}
        onClick={handleSignOut}
        className={cn(
          "px-2.5 py-1 text-[11px] transition-colors font-semibold",
          isCosmic
            ? "text-zinc-400 hover:text-rose-400 border border-yellow-500/20 hover:border-rose-500/40 hover:bg-rose-500/10"
            : "text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-500/40 rounded"
        )}
        title="Wyloguj się z aplikacji"
      >
        {isPending ? "..." : "Wyloguj"}
      </button>
    </div>
  );
}
