"use client";

import React, { useState, useEffect, useTransition } from "react";
import type { JobOffer, CvVariant, RecruitmentStatus } from "@/types/database";
import { updateOfferStatus, deleteJobOffer } from "@/features/offers/actions";
import { STATUS_LABELS } from "@/components/shared/StatusBadge";
import { getCvDownloadUrl } from "@/features/cv/actions";
import { OfferForm } from "./OfferForm";
import { cn } from "@/lib/utils";

export interface OfferDetailsModalProps {
  offer: JobOffer | null;
  isOpen: boolean;
  cvVariants?: CvVariant[];
  categories?: string[];
  isCosmic?: boolean;
  onClose: () => void;
  onDeleted?: (id: string) => void;
  onStatusChanged?: (id: string, newStatus: RecruitmentStatus) => void;
  onOfferUpdated?: (updatedOfferId?: string) => void;
}

/**
 * Okno modalne / arkusz szczegółów oferty pracy.
 * Zapewnia natychmiastowe akcje: dzwonienie (tel:), wysłanie maila (mailto:),
 * edycję wpisu, zmianę etapu rekrutacji, pobranie pliku CV oraz usunięcie wpisu.
 */
export function OfferDetailsModal({
  offer,
  isOpen,
  cvVariants,
  categories,
  isCosmic = false,
  onClose,
  onDeleted,
  onStatusChanged,
  onOfferUpdated,
}: OfferDetailsModalProps) {
  const [isPending, startTransition] = useTransition();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setIsEditing(false);
  }, [offer?.id, isOpen]);

  if (!isOpen || !offer) return null;

  const handleStatusChange = (newStatus: RecruitmentStatus) => {
    startTransition(async () => {
      const res = await updateOfferStatus(offer.id, newStatus);
      if (res.success) {
        onStatusChanged?.(offer.id, newStatus);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Czy na pewno chcesz usunąć ofertę "${offer.title}"?`)) return;

    startTransition(async () => {
      const res = await deleteJobOffer(offer.id);
      if (res.success) {
        onDeleted?.(offer.id);
        onClose();
      }
    });
  };

  const handleDownloadCv = async () => {
    if (!offer.cv_variants?.file_path) return;
    const url = await getCvDownloadUrl(offer.cv_variants.file_path);
    if (url) {
      setDownloadUrl(url);
      window.open(url, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "w-full max-w-xl max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl relative text-xs",
          isCosmic
            ? "bg-[#080d1e] border border-indigo-500/40 text-slate-200 font-sans"
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
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white">
                Edycja oferty: {offer.title}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-white font-mono p-1"
              >
                ✕
              </button>
            </div>

            <OfferForm
              initialData={offer}
              cvVariants={cvVariants || []}
              categories={categories}
              isCosmic={isCosmic}
              onSuccess={(id) => {
                setIsEditing(false);
                if (onOfferUpdated) {
                  onOfferUpdated(id);
                } else {
                  window.location.reload();
                }
              }}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <>
            {/* Zamknij X */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-base font-mono p-1"
            >
              ✕
            </button>

            {/* Nagłówek */}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {offer.title}
              </h2>
              <p className="text-zinc-400 font-medium mt-0.5">
                {offer.company_name}
                {offer.company_address ? ` • ${offer.company_address}` : ""}
              </p>
            </div>

        {/* Sekcja szybkiego kontaktu */}
        <div className="p-3 bg-white/[0.03] border border-white/10 rounded-lg space-y-2">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Szybki kontakt:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {offer.contact_phone ? (
              <a
                href={`tel:${offer.contact_phone.replace(/\s/g, "")}`}
                className="flex items-center p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 rounded font-mono font-semibold"
              >
                <span>{offer.contact_phone}</span>
              </a>
            ) : (
              <div className="text-zinc-500 font-mono italic p-1">Brak telefonu</div>
            )}

            {offer.contact_email ? (
              <a
                href={`mailto:${offer.contact_email}`}
                className="flex items-center p-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 rounded font-mono font-semibold truncate"
              >
                <span className="truncate">{offer.contact_email}</span>
              </a>
            ) : (
              <div className="text-zinc-500 font-mono italic p-1">Brak e-maila</div>
            )}
          </div>

          {offer.source_url && (
            <div className="pt-1">
              <a
                href={offer.source_url}
                target="_blank"
                rel="noreferrer"
                className="text-yellow-400 hover:underline font-mono text-[11px] block truncate"
              >
                🔗 Ogłoszenie źródłowe ({offer.source_url}) ↗
              </a>
            </div>
          )}
        </div>

        {/* Zmiana etapu rekrutacji */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
            Aktualny etap rekrutacji:
          </label>
          <select
            value={offer.status}
            disabled={isPending}
            onChange={(e) => handleStatusChange(e.target.value as RecruitmentStatus)}
            className="w-full bg-zinc-950 border border-zinc-700 text-white p-2.5 rounded text-xs font-mono focus:border-cyan-400 outline-none"
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Metadane */}
        <div className="grid grid-cols-2 gap-2 text-zinc-300 font-mono text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px]">TRYB PRACY:</span>
            <span className="font-semibold uppercase">{offer.work_mode}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">WYNAGRODZENIE:</span>
            <span className="font-semibold">{offer.salary_range || "Nie określono"}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">PRZYPISANE CV:</span>
            <span className="font-semibold">{offer.cv_variants?.name || "Domyślne"}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">STATUS CV:</span>
            <span className={offer.is_cv_sent ? "text-emerald-400 font-bold" : "text-zinc-400"}>
              {offer.is_cv_sent ? "WYSŁANO" : "DO WYSŁANIA"}
            </span>
          </div>
        </div>

        {/* Wymagania i Notatki */}
        {offer.requirements && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Wymagania i zakres:
            </span>
            <div className="bg-black/30 p-2.5 rounded border border-white/5 whitespace-pre-wrap font-sans text-xs text-zinc-300 max-h-36 overflow-y-auto">
              {offer.requirements}
            </div>
          </div>
        )}

        {offer.notes && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              Prywatne notatki:
            </span>
            <div className="bg-black/30 p-2.5 rounded border border-white/5 whitespace-pre-wrap font-sans text-xs text-zinc-300">
              {offer.notes}
            </div>
          </div>
        )}

            {/* Pasek akcji dolnych */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleDelete}
                  className="text-rose-400 hover:text-rose-300 font-mono text-xs underline"
                >
                  Usuń ofertę
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-yellow-400 hover:text-yellow-300 font-mono text-xs underline font-semibold"
                >
                  Edytuj ofertę
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-semibold"
              >
                Zamknij
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
