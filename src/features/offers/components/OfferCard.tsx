"use client";

import React from "react";
import type { JobOffer } from "@/types/database";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CvSentToggle } from "@/components/shared/CvSentToggle";
import { cn } from "@/lib/utils";

export interface OfferCardProps {
  offer: JobOffer;
  isCosmic?: boolean;
  onSelect?: (offer: JobOffer) => void;
  onCvToggled?: (newSent: boolean) => void;
}

/**
 * Dotykowa karta oferty na urządzenia mobilne (Touch Card).
 * Zoptymalizowana pod obsługę jedną ręką z bezpośrednim przełącznikiem wysyłki CV.
 */
export function OfferCard({
  offer,
  isCosmic = false,
  onSelect,
  onCvToggled,
}: OfferCardProps) {
  // Wyznaczenie klasy bocznej linii akcentującej dla Kosmicznego Modernizmu
  const getHairlineClass = () => {
    const c = offer.category.toLowerCase();
    if (c.includes("it") || c.includes("python")) return "border-l-2 border-l-cyan-400";
    if (c.includes("stolar")) return "border-l-2 border-l-amber-400";
    if (c.includes("detail") || c.includes("auto")) return "border-l-2 border-l-orange-400";
    if (c.includes("market")) return "border-l-2 border-l-purple-400";
    return "border-l-2 border-l-indigo-400";
  };

  if (isCosmic) {
    return (
      <div
        onClick={() => onSelect?.(offer)}
        className={cn(
          "p-4 cursor-pointer active:scale-[0.99] transition-all space-y-2.5 bg-[#0a0e1c]/80 backdrop-blur-md border border-indigo-500/20 relative",
          getHairlineClass()
        )}
        style={{
          clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)",
        }}
      >
        <div className="flex items-center justify-between text-xs">
          <CategoryPill category={offer.category} isCosmic />
          <StatusBadge status={offer.status} isCosmic />
        </div>

        <div>
          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
            {offer.title}
          </h3>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            {offer.company_name}
            {offer.company_address ? ` • ${offer.company_address}` : ""}
          </p>
        </div>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 text-[10px] truncate max-w-[150px]">
            {offer.cv_variants?.name || "CV Domyślne"}
          </span>
          <CvSentToggle
            offerId={offer.id}
            initialSent={offer.is_cv_sent}
            isCosmic
            onToggled={onCvToggled}
          />
        </div>
      </div>
    );
  }

  // Wariant 1: Zinc Technical (Shadcn Standard)
  return (
    <div
      onClick={() => onSelect?.(offer)}
      className="bg-zinc-900 p-3.5 rounded-2xl border border-zinc-800 shadow-md cursor-pointer active:scale-[0.99] transition-all space-y-2"
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryPill category={offer.category} />
        <StatusBadge status={offer.status} />
      </div>

      <div>
        <h3 className="text-sm font-bold text-white">{offer.title}</h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {offer.company_name}
          {offer.company_address ? ` • ${offer.company_address}` : ""}
        </p>
      </div>

      <div className="mt-2 pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
        <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[140px]">
          {offer.cv_variants?.name || "CV Domyślne"}
        </span>
        <CvSentToggle
          offerId={offer.id}
          initialSent={offer.is_cv_sent}
          onToggled={onCvToggled}
        />
      </div>
    </div>
  );
}
