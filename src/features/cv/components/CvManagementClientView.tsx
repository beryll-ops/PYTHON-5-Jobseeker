"use client";

import React, { useState } from "react";
import type { CvVariant } from "@/types/database";
import type { JobCategory } from "@/features/categories/types";
import { deleteCvVariant, getCvDownloadUrl } from "@/features/cv/actions";
import { CvUploadModal } from "@/features/cv/components/CvUploadModal";
import { CategoryManager } from "@/features/categories/components/CategoryManager";
import { cn } from "@/lib/utils";

export interface CvManagementClientViewProps {
  initialVariants: CvVariant[];
  initialCategories: JobCategory[];
  isCosmic?: boolean;
}

export function CvManagementClientView({
  initialVariants,
  initialCategories,
  isCosmic = false,
}: CvManagementClientViewProps) {
  const [variants, setVariants] = useState<CvVariant[]>(initialVariants);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Czy usunąć wariant "${name}"?`)) return;
    const res = await deleteCvVariant(id);
    if (res.success) {
      setVariants((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleDownload = async (filePath: string | null) => {
    if (!filePath) {
      alert("Do tego wariantu nie został wgrany plik PDF (wariant szablonowy).");
      return;
    }
    const url = await getCvDownloadUrl(filePath);
    if (url) {
      window.open(url, "_blank");
    } else {
      alert("Nie udało się pobrać pliku.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* SEKCJA 1: Warianty CV */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase">
              // ZARZĄDZANIE_DOKUMENTACJĄ
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
              Warianty CV
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Różne wersje CV dopasowane do branż (np. Python, Stolarstwo, Car Detailing).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className={cn(
              "px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all",
              isCosmic
                ? "cosmic-btn"
                : "bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
            )}
          >
            + Nowy Wariant CV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {variants.map((v) => (
            <div
              key={v.id}
              className={cn(
                "p-4 flex flex-col justify-between space-y-3",
                isCosmic
                  ? "cosmic-card"
                  : "bg-zinc-900 border border-zinc-800 rounded-xl"
              )}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-zinc-500 text-[10px]">
                    {v.file_path ? "📄 Plik PDF" : "📝 Bez pliku"}
                  </span>
                  {v.is_default && (
                    <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
                      Domyślne
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{v.name}</h3>
                <p className="text-xs text-zinc-400 font-mono mt-1 truncate">
                  {v.file_path || "Brak podpiętego pliku PDF"}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => handleDownload(v.file_path)}
                  className="text-cyan-400 hover:underline font-mono text-[11px]"
                >
                  Pobierz PDF ↗
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(v.id, v.name)}
                  className="text-rose-400 hover:text-rose-300 font-mono text-[11px]"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEKCJA 2: Kategorie Pracy */}
      <section className="pt-6 border-t border-white/10">
        <CategoryManager
          initialCategories={initialCategories}
          isCosmic={isCosmic}
        />
      </section>

      <CvUploadModal
        isOpen={isModalOpen}
        isCosmic={isCosmic}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}
