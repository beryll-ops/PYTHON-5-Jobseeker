"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CvVariant } from "@/types/database";
import type { CreateCvVariantInput } from "./types";

/**
 * Pobiera listę wariantów CV zalogowanego użytkownika posortowaną po dacie utworzenia.
 */
export async function getCvVariants(): Promise<CvVariant[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("cv_variants")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Błąd podczas pobierania wariantów CV:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Tworzy nowy wariant CV (np. "Python Dev", "Stolarstwo").
 * Jeśli isDefault jest zaznaczone, usuwa flagę domyślną z pozostałych wariantów.
 */
export async function createCvVariant(input: CreateCvVariantInput): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak autoryzacji użytkownika." };
  }

  if (input.isDefault) {
    // Reset poprzedniego wariantu domyślnego
    await supabase
      .from("cv_variants")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("cv_variants").insert({
    user_id: user.id,
    name: input.name,
    file_path: input.filePath || null,
    is_default: input.isDefault ?? false,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/cv");
  revalidatePath("/");
  return { success: true };
}

/**
 * Usuwa wariant CV użytkownika.
 */
export async function deleteCvVariant(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak autoryzacji." };
  }

  const { error } = await supabase
    .from("cv_variants")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/cv");
  return { success: true };
}

/**
 * Generuje bezpieczny, podpisany URL (Signed URL ważny 1h) do podglądu pliku PDF z bucketu 'resumes'.
 */
export async function getCvDownloadUrl(filePath: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("resumes")
    .createSignedUrl(filePath, 3600);

  if (error || !data?.signedUrl) {
    console.error("Błąd generowania Signed URL dla CV:", error?.message);
    return null;
  }

  return data.signedUrl;
}
