"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type JobCategory, DEFAULT_CATEGORIES } from "./types";

/**
 * Pobiera listę kategorii pracy dla zalogowanego użytkownika.
 * Przy pierwszym logowaniu użytkownika automatycznie inicjalizuje zestaw domyślnych kategorii.
 */
export async function getCategories(): Promise<JobCategory[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Tryb gościa / demo: zwraca domyślne kategorie
    return DEFAULT_CATEGORIES.map((name, index) => ({
      id: `default-${index}`,
      user_id: "demo-user",
      name,
      created_at: new Date().toISOString(),
    }));
  }

  const { data, error } = await supabase
    .from("job_categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) {
    console.error("Błąd pobierania kategorii pracy:", error.message);
    return [];
  }

  // Jeśli użytkownik nie ma jeszcze zdefiniowanych kategorii, automatycznie inicjalizujemy bazowe
  if (!data || data.length === 0) {
    const seedPayload = DEFAULT_CATEGORIES.map((name) => ({
      user_id: user.id,
      name,
    }));

    const { data: seeded, error: seedError } = await supabase
      .from("job_categories")
      .insert(seedPayload)
      .select("*")
      .order("name", { ascending: true });

    if (!seedError && seeded) {
      return seeded;
    }
  }

  return data || [];
}

/**
 * Dodaje nową kategorię pracy dla zalogowanego użytkownika.
 */
export async function createCategory(name: string): Promise<{ success: boolean; category?: JobCategory; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Nazwa kategorii nie może być pusta." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak autoryzacji użytkownika." };
  }

  const { data, error } = await supabase
    .from("job_categories")
    .insert({
      user_id: user.id,
      name: trimmed,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Taka kategoria już istnieje." };
    }
    return { success: false, error: error.message };
  }

  revalidatePath("/cv");
  revalidatePath("/");
  return { success: true, category: data };
}

/**
 * Edytuje nazwę istniejącej kategorii i kaskadowo aktualizuje przypisane oferty w job_offers.
 */
export async function updateCategory(id: string, newName: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: "Nowa nazwa kategorii nie może być pusta." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak autoryzacji." };
  }

  // 1. Pobranie starej nazwy kategorii
  const { data: currentCat, error: fetchErr } = await supabase
    .from("job_categories")
    .select("name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !currentCat) {
    return { success: false, error: "Nie znaleziono kategorii do edycji." };
  }

  const oldName = currentCat.name;

  // 2. Aktualizacja rekordu w tabeli job_categories
  const { error: updateErr } = await supabase
    .from("job_categories")
    .update({ name: trimmed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // 3. Aktualizacja istniejących ofert pracy, które były przypisane do starej nazwy
  await supabase
    .from("job_offers")
    .update({ category: trimmed })
    .eq("category", oldName)
    .eq("user_id", user.id);

  revalidatePath("/cv");
  revalidatePath("/");
  return { success: true };
}

/**
 * Usuwa kategorię pracy użytkownika.
 */
export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const { error } = await supabase
    .from("job_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/cv");
  revalidatePath("/");
  return { success: true };
}
