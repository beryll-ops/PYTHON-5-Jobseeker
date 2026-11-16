import React from "react";
import type { RecruitmentStatus } from "@/types/database";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: RecruitmentStatus;
  isCosmic?: boolean;
  className?: string;
}

export const STATUS_LABELS: Record<RecruitmentStatus, string> = {
  saved: "Do przejrzenia",
  applied: "Zaaplikowano",
  contacted: "Rekruter dzwonił",
  interview: "Rozmowa rekrutacyjna",
  task: "Zadanie rekrutacyjne",
  offer_received: "Złożono ofertę",
  rejected: "Odrzucona",
  archived: "Archiwum",
};

/**
 * Reużywalny wskaźnik statusu rekrutacji.
 * W stylu Zinc renderuje klasyczną zaokrągloną pigułkę.
 * W stylu Kosmicznym renderuje czysty, surowy tekst bez zbędnych glyphów i ikon.
 */
export function StatusBadge({ status, isCosmic = false, className }: StatusBadgeProps) {
  const label = STATUS_LABELS[status] || status;

  if (isCosmic) {
    // Styl Kosmiczny Modernizm: czysta typografia, wyrazisty kolor etapu, bez piktogramów
    const cosmicColors: Record<RecruitmentStatus, string> = {
      saved: "text-zinc-400",
      applied: "text-blue-300",
      contacted: "text-amber-300",
      interview: "text-purple-300",
      task: "text-indigo-300",
      offer_received: "text-emerald-300",
      rejected: "text-rose-400",
      archived: "text-zinc-500",
    };

    return (
      <span className={cn("font-mono text-xs font-medium tracking-tight", cosmicColors[status], className)}>
        {label}
      </span>
    );
  }

  // Styl Zinc: klasyczna zaokrąglona pigułka shadcn
  const zincColors: Record<RecruitmentStatus, string> = {
    saved: "bg-zinc-800 text-zinc-300 border-zinc-700",
    applied: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    contacted: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    interview: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    task: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    offer_received: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    archived: "bg-zinc-900 text-zinc-500 border-zinc-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
        zincColors[status],
        className
      )}
    >
      {label}
    </span>
  );
}
