"use client";

import React, { useState, useTransition } from "react";
import type { JobCategory } from "@/features/categories/types";
import { createCategory, updateCategory, deleteCategory } from "@/features/categories/actions";
import { cn } from "@/lib/utils";

export interface CategoryManagerProps {
  initialCategories: JobCategory[];
  isCosmic?: boolean;
}

/**
 * Komponent zarządzania kategoriami pracy (sektorami) użytkownika.
 * Umożliwia dodawanie nowych branż, edycję istniejących nazw oraz ich usuwanie.
 */
export function CategoryManager({
  initialCategories,
  isCosmic = false,
}: CategoryManagerProps) {
  const [categories, setCategories] = useState<JobCategory[]>(initialCategories);
  const [newCatName, setNewCatName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await createCategory(newCatName.trim());
      if (res.success && res.category) {
        setCategories((prev) => [...prev, res.category!]);
        setNewCatName("");
      } else {
        setErrorMessage(res.error || "Błąd dodawania kategorii.");
      }
    });
  };

  const startEditing = (cat: JobCategory) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await updateCategory(id, editingName.trim());
      if (res.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === id ? { ...c, name: editingName.trim() } : c))
        );
        setEditingId(null);
      } else {
        setErrorMessage(res.error || "Błąd aktualizacji kategorii.");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Czy na pewno usunąć kategorię "${name}"?`)) return;
    setErrorMessage(null);

    startTransition(async () => {
      const res = await deleteCategory(id);
      if (res.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      } else {
        setErrorMessage(res.error || "Błąd usuwania kategorii.");
      }
    });
  };

  return (
    <div
      className={cn(
        "p-5 space-y-4",
        isCosmic
          ? "cosmic-card"
          : "bg-zinc-900 border border-zinc-800 rounded-2xl"
      )}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <h2 className="text-sm font-bold text-white uppercase font-mono">
            {isCosmic ? "// KATEGORIE_PRACY" : "Kategorie pracy"}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Zarządzaj własnymi branżami. Używane w formularzu ofert i filtrach.
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          Zdefiniowane: {categories.length}
        </span>
      </div>

      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded text-xs font-mono">
          {errorMessage}
        </div>
      )}

      {/* Formularz dodawania nowej kategorii */}
      <form onSubmit={handleAdd} className="flex gap-2 text-xs">
        <input
          type="text"
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
          placeholder="Nowa kategoria (np. Logistyka, Gastronomia...)"
          className="flex-1 bg-zinc-950 border border-zinc-700 text-white px-3 py-2 rounded focus:border-cyan-400 outline-none text-xs"
        />
        <button
          type="submit"
          disabled={isPending || !newCatName.trim()}
          className={cn(
            "px-4 py-2 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50",
            isCosmic
              ? "cosmic-btn"
              : "bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm"
          )}
        >
          {isPending ? "Zapis..." : "+ Dodaj"}
        </button>
      </form>

      {/* Lista kategorii */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-3 bg-black/40 border border-white/5 rounded-lg flex items-center justify-between gap-2 text-xs"
          >
            {editingId === cat.id ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full bg-zinc-950 border border-cyan-400 text-white px-2 py-1 rounded text-xs outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(cat.id)}
                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[11px]"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="font-mono text-zinc-200 font-semibold truncate">
                  {isCosmic ? `// ${cat.name}` : cat.name}
                </span>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEditing(cat)}
                    className="text-zinc-400 hover:text-cyan-300 font-mono text-[11px] p-1"
                    title="Edytuj nazwę"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cat.id, cat.name)}
                    className="text-zinc-500 hover:text-rose-400 font-mono text-[11px] p-1"
                    title="Usuń kategorię"
                  >
                    🗑
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
