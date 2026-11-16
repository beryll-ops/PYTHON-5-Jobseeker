import { z } from "zod";

/**
 * Schemat walidacji formularza dodawania i edycji oferty pracy.
 * Zgodny ze specyfikacją z 02-manual-input-and-form-ux.md.
 */
export const offerFormSchema = z.object({
  title: z
    .string()
    .min(2, "Tytuł stanowiska musi mieć co najmniej 2 znaki")
    .max(150, "Tytuł nie może przekraczać 150 znaków"),
  company_name: z
    .string()
    .min(1, "Nazwa firmy lub pracodawcy jest wymagana")
    .max(150, "Nazwa firmy nie może przekraczać 150 znaków"),
  category: z
    .string()
    .min(1, "Wybierz lub wpisz kategorię branżową"),
  company_address: z.string().optional().default(""),
  contact_phone: z.string().optional().default(""),
  contact_email: z
    .string()
    .email("Wpisz poprawny adres e-mail")
    .optional()
    .or(z.literal(""))
    .default(""),
  source_url: z
    .string()
    .url("Wpisz poprawny adres URL (np. https://...)")
    .optional()
    .or(z.literal(""))
    .default(""),
  cv_variant_id: z.string().optional().nullable().default(null),
  is_cv_sent: z.boolean().default(false),
  status: z.enum([
    "saved",
    "applied",
    "contacted",
    "interview",
    "task",
    "offer_received",
    "rejected",
    "archived",
  ]).default("saved"),
  work_mode: z.enum(["remote", "hybrid", "onsite"]).default("remote"),
  salary_range: z.string().optional().default(""),
  requirements: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type OfferFormData = z.infer<typeof offerFormSchema>;
