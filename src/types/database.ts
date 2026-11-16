/**
 * Typy bazy danych PostgreSQL / Supabase dla aplikacji Jobseeker.
 * Ściśle odzwierciedlają schemat zdefiniowany w 03-data-model-and-database.md.
 */

export type WorkMode = "remote" | "hybrid" | "onsite";

export type RecruitmentStatus =
  | "saved"          // Do przejrzenia
  | "applied"        // Zaaplikowano (CV wysłane)
  | "contacted"      // Rekruter się skontaktował (telefon/mail)
  | "interview"      // Rozmowa rekrutacyjna / techniczna
  | "task"           // Zadanie rekrutacyjne
  | "offer_received" // Złożono ofertę zatrudnienia
  | "rejected"       // Odrzucona / brak odpowiedzi
  | "archived";      // Zarchiwizowana

export type CvVariant = {
  id: string;
  user_id: string;
  name: string;
  file_path: string | null;
  is_default: boolean;
  created_at: string;
};

export type JobOffer = {
  id: string;
  user_id: string;
  cv_variant_id: string | null;
  title: string;
  category: string;
  company_name: string;
  company_address: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  source_url: string | null;
  is_cv_sent: boolean;
  status: RecruitmentStatus;
  work_mode: WorkMode;
  salary_range: string | null;
  requirements: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;

  // Opcjonalne relacje złączeniowe (JOIN)
  cv_variants?: Pick<CvVariant, "id" | "name" | "file_path"> | null;
};

export type OfferStatusHistory = {
  id: string;
  offer_id: string;
  user_id: string;
  status: RecruitmentStatus;
  comment: string | null;
  changed_at: string;
};

export type JobCategory = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      job_categories: {
        Row: JobCategory;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      cv_variants: {
        Row: CvVariant;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          file_path?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          file_path?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      job_offers: {
        Row: JobOffer;
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          company_name: string;
          category: string;
          company_address?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          source_url?: string | null;
          cv_variant_id?: string | null;
          is_cv_sent?: boolean;
          status?: RecruitmentStatus;
          work_mode?: WorkMode;
          salary_range?: string | null;
          requirements?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          company_name?: string;
          category?: string;
          company_address?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          source_url?: string | null;
          cv_variant_id?: string | null;
          is_cv_sent?: boolean;
          status?: RecruitmentStatus;
          work_mode?: WorkMode;
          salary_range?: string | null;
          requirements?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      offer_status_history: {
        Row: OfferStatusHistory;
        Insert: {
          id?: string;
          offer_id: string;
          user_id: string;
          status: RecruitmentStatus;
          comment?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          offer_id?: string;
          user_id?: string;
          status?: RecruitmentStatus;
          comment?: string | null;
          changed_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
