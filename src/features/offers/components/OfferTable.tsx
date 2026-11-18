"use client";

import React from "react";
import type { JobOffer } from "@/types/database";
import { CategoryPill } from "@/components/shared/CategoryPill";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CvSentToggle } from "@/components/shared/CvSentToggle";
import { cn } from "@/lib/utils";

export interface OfferTableProps {
  offers: JobOffer[];
  isCosmic?: boolean;
  onSelect?: (offer: JobOffer) => void;
  onCvToggled?: (offerId: string, newSent: boolean) => void;
}

/**
 * Tabela ofert pracy dla widoku desktopowego.
 * Umożliwia szybki przegląd, bezpośrednią zmianę statusu wysyłki CV
 * oraz klikalne łącza tel: i mailto:.
 */
export function OfferTable({
  offers,
  isCosmic = false,
  onSelect,
  onCvToggled,
}: OfferTableProps) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500 font-mono text-xs">
        Brak zarejestrowanych ofert spełniających kryteria.
      </div>
    );
  }

  if (isCosmic) {
    return (
      <div
        className="border border-yellow-500/25 bg-[#09090c]/80 backdrop-blur-md overflow-hidden shadow-2xl"
        style={{
          clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-yellow-500/20 text-zinc-400 font-mono text-[11px] uppercase tracking-wider bg-white/[0.02]">
                <th className="py-3 px-4">Stanowisko // Pracodawca</th>
                <th className="py-3 px-3">Sektor</th>
                <th className="py-3 px-3">Wariant CV</th>
                <th className="py-3 px-3 text-center">CV Wysłano</th>
                <th className="py-3 px-3">Status etapu</th>
                <th className="py-3 px-3">Kontakt bezpośredni</th>
                <th className="py-3 px-4 text-right">Akcja</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {offers.map((offer) => (
                <tr
                  key={offer.id}
                  onClick={() => onSelect?.(offer)}
                  className="hover:bg-yellow-500/[0.04] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-sm text-white group-hover:text-yellow-400 transition-colors tracking-tight">
                      {offer.title}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono mt-0.5">
                      {offer.company_name}
                      {offer.company_address ? ` • ${offer.company_address}` : ""}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <CategoryPill category={offer.category} isCosmic />
                  </td>

                  <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">
                    {offer.cv_variants?.name || "CV Domyślne"}
                  </td>

                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <CvSentToggle
                      offerId={offer.id}
                      initialSent={offer.is_cv_sent}
                      isCosmic
                      onToggled={(sent) => onCvToggled?.(offer.id, sent)}
                    />
                  </td>

                  <td className="py-3 px-3">
                    <StatusBadge status={offer.status} isCosmic />
                  </td>

                  <td className="py-3 px-3 font-mono" onClick={(e) => e.stopPropagation()}>
                    {offer.contact_phone ? (
                      <a
                        href={`tel:${offer.contact_phone.replace(/\s/g, "")}`}
                        className="text-yellow-400 hover:underline block font-semibold"
                      >
                        {offer.contact_phone}
                      </a>
                    ) : null}
                    {offer.contact_email ? (
                      <a
                        href={`mailto:${offer.contact_email}`}
                        className="text-zinc-400 hover:text-white text-[11px] block truncate max-w-[140px]"
                      >
                        {offer.contact_email}
                      </a>
                    ) : null}
                    {!offer.contact_phone && !offer.contact_email && (
                      <span className="text-zinc-600 text-[10px]">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(offer)}
                      className="px-3 py-1 text-xs font-mono text-zinc-300 hover:text-yellow-300 uppercase tracking-wider bg-zinc-900 border border-zinc-700 hover:border-yellow-400 transition-colors shadow-sm"
                      style={{
                        clipPath: "polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%)",
                      }}
                    >
                      Otwórz ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Wariant 1: Zinc Technical (Shadcn Standard)
  return (
    <div className="bg-zinc-900/80 rounded-2xl border border-zinc-800 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-medium bg-zinc-950/40">
              <th className="py-3 px-4">Stanowisko i Firma</th>
              <th className="py-3 px-3">Kategoria</th>
              <th className="py-3 px-3">Wariant CV</th>
              <th className="py-3 px-3 text-center">CV Wysłano</th>
              <th className="py-3 px-3">Status etapu</th>
              <th className="py-3 px-3">Kontakt bezpośredni</th>
              <th className="py-3 px-4 text-right">Akcja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {offers.map((offer) => (
              <tr
                key={offer.id}
                onClick={() => onSelect?.(offer)}
                className="hover:bg-zinc-800/40 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{offer.title}</div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    {offer.company_name}
                    {offer.company_address ? ` • ${offer.company_address}` : ""}
                  </div>
                </td>

                <td className="py-3 px-3">
                  <CategoryPill category={offer.category} />
                </td>

                <td className="py-3 px-3 text-zinc-300 font-mono text-[11px]">
                  {offer.cv_variants?.name || "CV Domyślne"}
                </td>

                <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <CvSentToggle
                    offerId={offer.id}
                    initialSent={offer.is_cv_sent}
                    onToggled={(sent) => onCvToggled?.(offer.id, sent)}
                  />
                </td>

                <td className="py-3 px-3">
                  <StatusBadge status={offer.status} />
                </td>

                <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                  {offer.contact_phone ? (
                    <a
                      href={`tel:${offer.contact_phone.replace(/\s/g, "")}`}
                      className="text-yellow-400 hover:underline block font-semibold"
                    >
                      {offer.contact_phone}
                    </a>
                  ) : null}
                  {offer.contact_email ? (
                    <a
                      href={`mailto:${offer.contact_email}`}
                      className="text-zinc-400 hover:text-white block truncate max-w-[140px]"
                    >
                      {offer.contact_email}
                    </a>
                  ) : null}
                  {!offer.contact_phone && !offer.contact_email && (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>

                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(offer)}
                    className="px-2.5 py-1 rounded-md text-xs bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-yellow-400 hover:border-yellow-500/40 transition-colors"
                  >
                    Karta ↗
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
