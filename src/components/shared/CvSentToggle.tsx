"use client";

import React, { useState, useTransition } from "react";
import { toggleCvSent } from "@/features/offers/actions";
import { cn } from "@/lib/utils";

export interface CvSentToggleProps {
  offerId: string;
  initialSent: boolean;
  isCosmic?: boolean;
  className?: string;
  onToggled?: (newSent: boolean) => void;
}

/**
 * Przycisk One-Tap Toggle do błyskawicznego oznaczania czy CV zostało wysłane.
 * Działa optymistycznie (natychmiastowa reakcja UI) i asynchronicznie zapisuje w Supabase.
 */
export function CvSentToggle({
  offerId,
  initialSent,
  isCosmic = false,
  className,
  onToggled,
}: CvSentToggleProps) {
  const [isSent, setIsSent] = useState(initialSent);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !isSent;
    setIsSent(nextState);
    if (onToggled) onToggled(nextState);

    startTransition(async () => {
      const res = await toggleCvSent(offerId, nextState);
      if (!res.success) {
        // Rollback w razie błędu sieci/bazy
        setIsSent(!nextState);
        if (onToggled) onToggled(!nextState);
      }
    });
  };

  if (isCosmic) {
    return (
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider transition-all block",
          isSent
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30"
            : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700",
          isPending && "opacity-60 cursor-wait",
          className
        )}
        style={{
          clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
        }}
        title="Kliknij, aby zmienić status wysyłki CV"
      >
        {isSent ? "[WYSŁANO]" : "[DO WYSŁANIA]"}
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors",
        isSent
          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
          : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700/80",
        isPending && "opacity-60 cursor-wait",
        className
      )}
      title="Kliknij, aby zmienić status wysyłki CV"
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isSent ? "bg-emerald-400" : "bg-zinc-500"
        )}
      />
      {isSent ? "Wysłano" : "Do wysłania"}
    </button>
  );
}
