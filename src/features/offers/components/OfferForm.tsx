"use client";

import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { offerFormSchema, type OfferFormData } from "@/features/offers/schema";
import { createJobOffer, updateJobOffer } from "@/features/offers/actions";
import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import type { CvVariant, JobOffer } from "@/types/database";
import { cn } from "@/lib/utils";

export interface OfferFormProps {
  initialData?: JobOffer;
  cvVariants: CvVariant[];
  categories?: string[];
  isCosmic?: boolean;
  onSuccess?: (newOfferId?: string) => void;
  onCancel?: () => void;
}

const COMMON_CATEGORIES = [
  "IT / Software",
  "Stolarstwo / Meble",
  "Car Detailing / Auto",
  "Marketing / Copywriting",
  "Handel / Sprzedaż",
  "Inne",
];

/**
 * Formularz ręcznego wprowadzania ofert pracy.
 * Zgodnie ze specyfikacją z 02-manual-input-and-form-ux.md:
 * - W polach jednoliniowych (input) klawisz Enter natychmiast zatwierdza formularz.
 * - W polach wieloliniowych (textarea) klawisz Enter tworzy nową linię tekstu.
 */
export function OfferForm({
  initialData,
  cvVariants,
  categories,
  isCosmic = false,
  onSuccess,
  onCancel,
}: OfferFormProps) {
  const [isPending, startTransition] = useTransition();

  const availableCategories =
    categories && categories.length > 0 ? categories : COMMON_CATEGORIES;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      company_name: initialData?.company_name || "",
      category: initialData?.category || availableCategories[0],
      company_address: initialData?.company_address || "",
      contact_phone: initialData?.contact_phone || "",
      contact_email: initialData?.contact_email || "",
      source_url: initialData?.source_url || "",
      cv_variant_id: initialData?.cv_variant_id ?? (cvVariants.find((v) => v.is_default)?.id || null),
      is_cv_sent: initialData?.is_cv_sent ?? false,
      status: initialData?.status || "saved",
      work_mode: initialData?.work_mode || "remote",
      salary_range: initialData?.salary_range || "",
      requirements: initialData?.requirements || "",
      notes: initialData?.notes || "",
    },
  });

  const onSubmit = (data: OfferFormData) => {
    startTransition(async () => {
      if (initialData) {
        const res = await updateJobOffer(initialData.id, data);
        if (res.success) {
          onSuccess?.(initialData.id);
        } else {
          alert(`Błąd podczas edycji oferty: ${res.error}`);
        }
      } else {
        const res = await createJobOffer(data);
        if (res.success) {
          onSuccess?.(res.id);
        } else {
          alert(`Błąd podczas dodawania oferty: ${res.error}`);
        }
      }
    });
  };

  /**
   * Obsługa klawisza Enter w polach jednoliniowych.
   * W polach input nie blokujemy domyślnego zachowania przeglądarki (form.submit()).
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // Formularz naturalnie wywoła handleSubmit(onSubmit)
    }
  };

  /**
   * W polach wieloliniowych (textarea) Ctrl+Enter również zatwierdza formularz,
   * a sam Enter tworzy nową linię tekstu.
   */
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const inputClass =
    "w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors shadow-inner";

  const selectClass =
    "w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors cursor-pointer shadow-inner";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs font-sans">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Stanowisko */}
        <div className="sm:col-span-2">
          <input
            {...register("title")}
            onKeyDown={handleKeyDown}
            placeholder="Stanowisko / Tytuł oferty *"
            className={inputClass}
          />
          {errors.title && (
            <p className="text-rose-400 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Firma */}
        <div>
          <input
            {...register("company_name")}
            onKeyDown={handleKeyDown}
            placeholder="Firma / Pracodawca *"
            className={inputClass}
          />
          {errors.company_name && (
            <p className="text-rose-400 text-xs mt-1">{errors.company_name.message}</p>
          )}
        </div>

        {/* Kategoria */}
        <div>
          <select
            {...register("category")}
            className={selectClass}
          >
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                Branża: {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Adres / Miasto */}
        <div>
          <input
            {...register("company_address")}
            onKeyDown={handleKeyDown}
            placeholder="Lokalizacja / Adres (np. Warszawa, Pruszków)"
            className={inputClass}
          />
        </div>

        {/* Tryb pracy */}
        <div>
          <select
            {...register("work_mode")}
            className={selectClass}
          >
            <option value="remote">Tryb pracy: Zdalnie</option>
            <option value="hybrid">Tryb pracy: Hybrydowo</option>
            <option value="onsite">Tryb pracy: Stacjonarnie (biuro / warsztat)</option>
          </select>
        </div>

        {/* Telefon do kontaktu */}
        <div>
          <input
            {...register("contact_phone")}
            onKeyDown={handleKeyDown}
            placeholder="Telefon do rekrutera (np. +48 501 234 567)"
            className={inputClass}
          />
        </div>

        {/* Email do kontaktu */}
        <div>
          <input
            {...register("contact_email")}
            onKeyDown={handleKeyDown}
            placeholder="E-mail do kontaktu (np. rekrutacja@firma.pl)"
            className={inputClass}
          />
          {errors.contact_email && (
            <p className="text-rose-400 text-xs mt-1">{errors.contact_email.message}</p>
          )}
        </div>

        {/* Widełki płacowe */}
        <div>
          <input
            {...register("salary_range")}
            onKeyDown={handleKeyDown}
            placeholder="Wynagrodzenie / Widełki (np. 8 000 - 12 000 PLN)"
            className={inputClass}
          />
        </div>

        {/* Przypisany wariant CV */}
        <div>
          <select
            {...register("cv_variant_id")}
            className={selectClass}
          >
            <option value="">Wariant CV: Domyślne CV</option>
            {cvVariants.map((v) => (
              <option key={v.id} value={v.id}>
                Wariant CV: {v.name} {v.is_default ? "(Domyślne)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Link do ogłoszenia */}
        <div className="sm:col-span-2">
          <input
            {...register("source_url")}
            onKeyDown={handleKeyDown}
            placeholder="Link do ogłoszenia (np. https://pracuj.pl/...)"
            className={inputClass}
          />
          {errors.source_url && (
            <p className="text-rose-400 text-xs mt-1">{errors.source_url.message}</p>
          )}
        </div>

        {/* Wymagania */}
        <div className="sm:col-span-2">
          <AutoResizeTextarea
            {...register("requirements")}
            onKeyDown={handleTextareaKeyDown}
            minHeight={110}
            maxHeight={360}
            placeholder="Wymagania i technologie (wklej z ogłoszenia)..."
          />
        </div>

        {/* Notatki własne */}
        <div className="sm:col-span-2">
          <AutoResizeTextarea
            {...register("notes")}
            onKeyDown={handleTextareaKeyDown}
            minHeight={80}
            maxHeight={260}
            placeholder="Prywatne notatki i ustalenia..."
          />
        </div>

        {/* Flaga CV Wysłano */}
        <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-zinc-900/60 rounded-lg border border-zinc-700/60">
          <input
            type="checkbox"
            id="is_cv_sent_cb"
            {...register("is_cv_sent")}
            className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-0 cursor-pointer"
          />
          <label htmlFor="is_cv_sent_cb" className="text-zinc-300 text-xs cursor-pointer select-none">
            Oznacz ofertę jako <span className="font-bold text-emerald-400">CV już wysłane</span> (automatycznie zmieni status na Zaaplikowano)
          </label>
        </div>
      </div>

      {/* Przyciski akcji */}
      <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
        <span className="text-[11px] text-zinc-500 font-mono">
          [Wskazówka]: Klawisz Enter zapisuje ofertę
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-semibold"
            >
              Anuluj
            </button>
          )}
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "px-5 py-2 font-bold text-xs uppercase tracking-wider transition-all",
              isCosmic
                ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                : "bg-blue-600 hover:bg-blue-500 text-white rounded"
            )}
            style={
              isCosmic
                ? {
                    clipPath:
                      "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                  }
                : undefined
            }
          >
            {isPending
              ? "Zapisywanie..."
              : initialData
              ? "Zapisz Zmiany (Enter)"
              : "+ Zapisz Ofertę (Enter)"}
          </button>
        </div>
      </div>
    </form>
  );
}
