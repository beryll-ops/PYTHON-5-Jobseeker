"use client";

import React, { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { createCvVariant } from "@/features/cv/actions";
import { cn } from "@/lib/utils";

export interface CvUploadModalProps {
  isOpen: boolean;
  isCosmic?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * Modal dodawania wariantu CV wraz z wgraniem pliku PDF do bucketu 'resumes' w Supabase Storage.
 */
export function CvUploadModal({
  isOpen,
  isCosmic = false,
  onClose,
  onSuccess,
}: CvUploadModalProps) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Wprowadź nazwę wariantu CV.");
      return;
    }

    setErrorMessage(null);

    startTransition(async () => {
      let uploadedFilePath: string | null = null;

      if (file) {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setErrorMessage("Brak autoryzacji użytkownika.");
          return;
        }

        const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const storagePath = `${user.id}/${Date.now()}_${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes")
          .upload(storagePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setErrorMessage(`Błąd wgrywania pliku PDF: ${uploadError.message}`);
          return;
        }

        uploadedFilePath = storagePath;
      }

      const res = await createCvVariant({
        name: name.trim(),
        filePath: uploadedFilePath,
        isDefault,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Wystąpił błąd podczas tworzenia wariantu CV.");
        return;
      }

      onSuccess?.();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className={cn(
          "w-full max-w-md p-6 space-y-4 shadow-2xl relative text-xs",
          isCosmic
            ? "bg-[#09090d] border border-yellow-500/35 text-slate-200 shadow-[0_0_35px_rgba(234,179,8,0.12)]"
            : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-2xl"
        )}
        style={
          isCosmic
            ? {
                clipPath:
                  "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)",
              }
            : undefined
        }
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm font-bold text-white uppercase font-mono">
            {isCosmic ? "// DODAJ_WARIANT_CV" : "Nowy wariant CV"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white font-mono p-1"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-mono">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 block">
              Nazwa wariantu (np. Python B2B, Stolarstwo PL) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. CV Python Senior 2026"
              className="w-full bg-zinc-950 border border-zinc-700 text-white p-2.5 rounded focus:border-yellow-400 outline-none text-xs transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-zinc-300 block">Plik CV (opcjonalny PDF)</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full bg-zinc-950 border border-zinc-700 text-zinc-400 p-2 rounded text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is_default_cv"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-zinc-700 text-yellow-400 accent-yellow-400 cursor-pointer"
            />
            <label htmlFor="is_default_cv" className="text-zinc-300 cursor-pointer select-none">
              Ustaw ten wariant jako domyślny
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-semibold"
            >
              Anuluj
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "px-5 py-2 font-black text-xs uppercase tracking-wider transition-all",
                isCosmic
                  ? "cosmic-btn"
                  : "bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded shadow-[0_0_15px_rgba(250,204,21,0.25)]"
              )}
            >
              {isPending ? "Wgrywanie..." : "Zapisz Wariant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
