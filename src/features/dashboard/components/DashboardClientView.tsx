"use client";

import React, { useState, useMemo } from "react";
import type { JobOffer, CvVariant, RecruitmentStatus } from "@/types/database";
import type { JobCategory } from "@/features/categories/types";
import { HudCvCounter } from "@/features/dashboard/components/HudCvCounter";
import { OfferFilters } from "@/features/offers/components/OfferFilters";
import { OfferTable } from "@/features/offers/components/OfferTable";
import { OfferCard } from "@/features/offers/components/OfferCard";
import { OfferForm } from "@/features/offers/components/OfferForm";
import { OfferDetailsModal } from "@/features/offers/components/OfferDetailsModal";
import { cn } from "@/lib/utils";

export interface DashboardClientViewProps {
  initialOffers: JobOffer[];
  cvVariants: CvVariant[];
  initialCategories?: JobCategory[];
  isCosmic?: boolean;
}

/**
 * Główny widok kokpitu ofert pracy.
 * Łączy tabelę desktopową, karty mobilne, pasek telemetrii HUD,
 * filtry oraz okna modalne dodawania i edycji ofert.
 */
export function DashboardClientView({
  initialOffers,
  cvVariants,
  initialCategories,
  isCosmic = false,
}: DashboardClientViewProps) {
  const [offers, setOffers] = useState<JobOffer[]>(initialOffers);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<RecruitmentStatus | "all">("all");
  const [onlyUnsent, setOnlyUnsent] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<JobOffer | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Unikalna lista kategorii: łączy kategorie z bazy danych użytkownika oraz istniejących ofert
  const categories = useMemo(() => {
    const set = new Set<string>();
    if (initialCategories) {
      initialCategories.forEach((c) => {
        if (c.name) set.add(c.name);
      });
    }
    offers.forEach((o) => {
      if (o.category) set.add(o.category);
    });
    return Array.from(set);
  }, [offers, initialCategories]);

  // Statystyki wysłanych CV
  const totalCount = offers.length;
  const sentCount = offers.filter((o) => o.is_cv_sent).length;

  // Filtrowanie listy ofert
  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      if (onlyUnsent && offer.is_cv_sent) return false;
      if (category !== "all" && offer.category !== category) return false;
      if (status !== "all" && offer.status !== status) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = offer.title.toLowerCase().includes(q);
        const matchesCompany = offer.company_name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCompany) return false;
      }
      return true;
    });
  }, [offers, search, category, status, onlyUnsent]);

  // Obsługa przełącznika wysyłki CV
  const handleCvToggled = (offerId: string, newSent: boolean) => {
    setOffers((prev) =>
      prev.map((o) =>
        o.id === offerId
          ? {
              ...o,
              is_cv_sent: newSent,
              status: newSent && o.status === "saved" ? "applied" : o.status,
            }
          : o
      )
    );
  };

  // Obsługa zmiany statusu w modalu szczegółów
  const handleStatusChanged = (offerId: string, newStatus: RecruitmentStatus) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
    if (selectedOffer && selectedOffer.id === offerId) {
      setSelectedOffer((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Obsługa usunięcia oferty
  const handleOfferDeleted = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    setSelectedOffer(null);
  };

  return (
    <div className="space-y-6">
      {/* Pasek telemetrii HUD (styl Kosmiczny) lub Pasek informacyjny (styl Zinc) */}
      {isCosmic ? (
        <HudCvCounter total={totalCount} sent={sentCount} />
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-white">Wskaźnik wysyłki CV:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
              {sentCount} / {totalCount} wysłane ({totalCount > 0 ? Math.round((sentCount / totalCount) * 100) : 0}%)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            + Dodaj Ofertę
          </button>
        </div>
      )}

      {/* Przycisk dodawania dla stylu kosmicznego */}
      {isCosmic && (
        <div className="flex justify-end items-center">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="cosmic-btn px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            + DODAJ OFERTĘ
          </button>
        </div>
      )}

      {/* Pasek filtrów */}
      <OfferFilters
        search={search}
        category={category}
        status={status}
        onlyUnsent={onlyUnsent}
        categories={categories}
        isCosmic={isCosmic}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        onOnlyUnsentChange={setOnlyUnsent}
      />

      {/* Widok Desktopowy: Tabela (ukryta na ekranach < md) */}
      <div className="hidden md:block">
        <OfferTable
          offers={filteredOffers}
          isCosmic={isCosmic}
          onSelect={setSelectedOffer}
          onCvToggled={handleCvToggled}
        />
      </div>

      {/* Widok Mobilny: Karty dotykowe (ukryte na ekranach >= md) */}
      <div className="block md:hidden space-y-3">
        {filteredOffers.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 text-xs font-mono">
            Brak ofert spełniających kryteria.
          </div>
        ) : (
          filteredOffers.map((offer) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              isCosmic={isCosmic}
              onSelect={setSelectedOffer}
              onCvToggled={(sent) => handleCvToggled(offer.id, sent)}
            />
          ))
        )}

        {/* Pływający przycisk dodawania na dole ekranu telefonu */}
        <div className="sticky bottom-4 pt-2">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className={cn(
              "w-full py-3 text-center font-bold text-xs uppercase tracking-wider shadow-2xl transition-all",
              isCosmic
                ? "cosmic-btn"
                : "bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            )}
          >
            + Dodaj Nową Ofertę
          </button>
        </div>
      </div>

      {/* Modal dodawania nowej oferty */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={cn(
              "w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative",
              isCosmic
                ? "bg-[#080d1e] border border-indigo-500/40 text-slate-200"
                : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl"
            )}
            style={
              isCosmic
                ? {
                    clipPath:
                      "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
                  }
                : undefined
            }
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white font-sans">
                Dodaj nową ofertę pracy
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-zinc-400 hover:text-white font-mono p-1"
              >
                ✕
              </button>
            </div>

            <OfferForm
              cvVariants={cvVariants}
              categories={categories}
              isCosmic={isCosmic}
              onSuccess={() => {
                setIsFormOpen(false);
                window.location.reload();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal szczegółów oferty */}
      <OfferDetailsModal
        offer={selectedOffer}
        isOpen={Boolean(selectedOffer)}
        cvVariants={cvVariants}
        categories={categories}
        isCosmic={isCosmic}
        onClose={() => setSelectedOffer(null)}
        onDeleted={handleOfferDeleted}
        onStatusChanged={handleStatusChanged}
        onOfferUpdated={() => {
          setSelectedOffer(null);
          window.location.reload();
        }}
      />
    </div>
  );
}
