import type { JobOffer, RecruitmentStatus, WorkMode } from "@/types/database";

export interface OfferFilters {
  search?: string;
  category?: string;
  status?: RecruitmentStatus | "all";
  isCvSent?: boolean;
}

export interface OfferInput {
  title: string;
  category: string;
  company_name: string;
  company_address?: string;
  contact_phone?: string;
  contact_email?: string;
  source_url?: string;
  cv_variant_id?: string | null;
  is_cv_sent: boolean;
  status: RecruitmentStatus;
  work_mode: WorkMode;
  salary_range?: string;
  requirements?: string;
  notes?: string;
}

export type { OfferFormData } from "./schema";
export type OfferWithCv = JobOffer;
