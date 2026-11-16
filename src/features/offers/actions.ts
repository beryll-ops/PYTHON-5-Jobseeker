"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { JobOffer, RecruitmentStatus } from "@/types/database";
import type { OfferFilters, OfferFormData } from "./types";

/**
 * Pobiera listę ofert pracy zalogowanego użytkownika z opcjonalnymi filtrami.
 * Dołącza nazwę i ścieżkę powiązanego wariantu CV.
 */
export async function getJobOffers(filters?: OfferFilters): Promise<JobOffer[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  let query = supabase
    .from("job_offers")
    .select(`
      *,
      cv_variants (
        id,
        name,
        file_path
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (typeof filters?.isCvSent === "boolean") {
    query = query.eq("is_cv_sent", filters.isCvSent);
  }

  if (filters?.search && filters.search.trim().length > 0) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`title.ilike.${term},company_name.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Błąd pobierania ofert pracy:", error.message);
    return [];
  }

  return (data as JobOffer[]) || [];
}

/**
 * Pobiera pojedynczą ofertę po jej identyfikatorze UUID.
 */
export async function getJobOfferById(id: string): Promise<JobOffer | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("job_offers")
    .select(`
      *,
      cv_variants (
        id,
        name,
        file_path
      )
    `)
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as JobOffer;
}

/**
 * Tworzy nową ofertę pracy w bazie.
 * Przeprowadza sanitizację danych kontaktowych (oczyszczanie wielokrotnych spacji).
 */
export async function createJobOffer(formData: OfferFormData): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak uwierzytelnienia użytkownika." };
  }

  // Normalizacja numeru telefonu: usuwamy podwójne spacje, zachowujemy czytelny format międzynarodowy
  const cleanedPhone = formData.contact_phone ? formData.contact_phone.trim().replace(/\s+/g, " ") : null;

  const { data, error } = await supabase
    .from("job_offers")
    .insert({
      user_id: user.id,
      title: formData.title.trim(),
      category: formData.category.trim(),
      company_name: formData.company_name.trim(),
      company_address: formData.company_address?.trim() || null,
      contact_phone: cleanedPhone,
      contact_email: formData.contact_email?.trim() || null,
      source_url: formData.source_url?.trim() || null,
      cv_variant_id: formData.cv_variant_id || null,
      is_cv_sent: formData.is_cv_sent ?? false,
      status: formData.status || "saved",
      work_mode: formData.work_mode || "remote",
      salary_range: formData.salary_range?.trim() || null,
      requirements: formData.requirements?.trim() || null,
      notes: formData.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, id: data.id };
}

/**
 * Aktualizuje istniejącą ofertę pracy w bazie.
 */
export async function updateJobOffer(
  id: string,
  formData: OfferFormData
): Promise<{ success: boolean; data?: JobOffer; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Brak uwierzytelnienia użytkownika." };
  }

  const cleanedPhone = formData.contact_phone ? formData.contact_phone.trim().replace(/\s+/g, " ") : null;

  const { data, error } = await supabase
    .from("job_offers")
    .update({
      title: formData.title.trim(),
      category: formData.category.trim(),
      company_name: formData.company_name.trim(),
      company_address: formData.company_address?.trim() || null,
      contact_phone: cleanedPhone,
      contact_email: formData.contact_email?.trim() || null,
      source_url: formData.source_url?.trim() || null,
      cv_variant_id: formData.cv_variant_id || null,
      is_cv_sent: formData.is_cv_sent ?? false,
      status: formData.status || "saved",
      work_mode: formData.work_mode || "remote",
      salary_range: formData.salary_range?.trim() || null,
      requirements: formData.requirements?.trim() || null,
      notes: formData.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(`
      *,
      cv_variants (
        id,
        name,
        file_path
      )
    `)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true, data: data as JobOffer };
}

/**
 * Szybkie przełączanie flagi is_cv_sent z poziomu karty mobilnej lub wiersza tabeli (One-Tap Toggle).
 */
export async function toggleCvSent(id: string, isCvSent: boolean): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Brak autoryzacji." };

  const { error } = await supabase
    .from("job_offers")
    .update({
      is_cv_sent: isCvSent,
      // Jeśli oznaczamy jako wysłane, a status był 'saved', automatycznie promujemy do 'applied'
      status: isCvSent ? "applied" : "saved",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

/**
 * Aktualizuje etap rekrutacji (status) i opcjonalnie rejestruje wpis w historii statusów.
 */
export async function updateOfferStatus(
  id: string,
  status: RecruitmentStatus,
  comment?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Brak autoryzacji." };

  const { error } = await supabase
    .from("job_offers")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  // Zapis do tabeli historii statusów
  await supabase.from("offer_status_history").insert({
    offer_id: id,
    user_id: user.id,
    status,
    comment: comment || null,
  });

  revalidatePath("/");
  return { success: true };
}

/**
 * Usuwa ofertę pracy z bazy.
 */
export async function deleteJobOffer(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Brak autoryzacji." };

  const { error } = await supabase
    .from("job_offers")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
