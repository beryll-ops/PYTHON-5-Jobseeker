"use client";

import React from "react";
import type { RecruitmentStatus } from "@/types/database";
import { STATUS_LABELS } from "@/components/shared/StatusBadge";
import { cn } from "@/lib/utils";

export interface OfferFiltersProps {
  search: string;
  category: string;
  status: RecruitmentStatus | "all";
  onlyUnsent: boolean;
  categories: string[];
  isCosmic?: boolean;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: RecruitmentStatus | "all") => void;
  onOnlyUnsentChange: (onlyUnsent: boolean) => void;
}

/**
 * Pasek narzędziowy z filtrami wyszukiwania ofert.
 * Umożliwia filtrowanie po tytule/firmie, sektorze branżowym, etapie rekrutacji
 * oraz szybkie zawężenie do pozycji, gdzie CV nie zostało jeszcze wysłane.
 */
export function OfferFilters({
  search,
  category,
  status,
  onlyUnsent,
  categories,
  isCosmic = false,
  onSearchChange,
  onCategoryChange,
  onStatusChange,
  onOnlyUnsentChange,
}: OfferFiltersProps) {
  return (
    <div
      className={cn(
        "p-3 space-y-3",
        isCosmic
          ? "bg-[#0a0e1c]/80 border border-indigo-500/20 backdrop-blur-md"
          : "bg-zinc-900/60 rounded-xl border border-zinc-800"
      )}
      style={
        isCosmic
          ? {
              clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)",
            }
          : undefined
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
        {/* Wyszukiwarka tekstowa */}
        <div className="sm:col-span-5 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Szukaj stanowiska lub firmy..."
            className="w-full bg-zinc-950 border border-zinc-700 text-white pl-3 pr-3 py-2 rounded focus:border-cyan-400 outline-none text-xs"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-2 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtr kategorii */}
        <div className="sm:col-span-3">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 text-white py-2 px-2.5 rounded focus:border-cyan-400 outline-none text-xs font-mono"
          >
            <option value="all">// WSZYSTKIE SEKTORY</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Filtr statusu */}
        <div className="sm:col-span-2">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as RecruitmentStatus | "all")}
            className="w-full bg-zinc-950 border border-zinc-700 text-white py-2 px-2.5 rounded focus:border-cyan-400 outline-none text-xs font-mono"
          >
            <option value="all">Wszystkie etapy</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Przełącznik "Tylko do wysłania" */}
        <div className="sm:col-span-2 flex items-center justify-start sm:justify-center">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[11px] font-mono text-zinc-300">
            <input
              type="checkbox"
              checked={onlyUnsent}
              onChange={(e) => onOnlyUnsentChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <span>Do wysłania</span>
          </label>
        </div>
      </div>
    </div>
  );
}
