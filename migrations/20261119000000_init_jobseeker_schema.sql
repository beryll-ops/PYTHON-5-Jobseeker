-- =============================================================================
-- MIGRACJA POCZĄTKOWA: SCHEMAT BAZY DANYCH DLA PYTHON-5 JOBSEEKER
-- =============================================================================
-- Tworzy tabele: cv_variants, job_offers, offer_status_history, job_categories
-- Konfiguruje Row Level Security (RLS) oraz bucket storage 'resumes' dla plików CV.
-- =============================================================================

-- 1. TYPY WYLICZENIOWE (ENUMS)
DO $$ BEGIN
    CREATE TYPE work_mode_type AS ENUM ('remote', 'hybrid', 'onsite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recruitment_status_type AS ENUM (
        'saved',           -- Do przejrzenia
        'applied',         -- Zaaplikowano (CV wysłane)
        'contacted',       -- Rekruter dzwonił / napisał
        'interview',       -- Rozmowa rekrutacyjna
        'task',            -- Zadanie rekrutacyjne
        'offer_received',  -- Złożono ofertę zatrudnienia
        'rejected',        -- Odrzucona / brak odpowiedzi
        'archived'         -- Zarchiwizowana
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABELA: job_categories (Kategorie pracy / sektory użytkownika)
CREATE TABLE IF NOT EXISTS public.job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_categories_user ON public.job_categories(user_id);

-- 3. TABELA: cv_variants (Warianty CV użytkownika)
CREATE TABLE IF NOT EXISTS public.cv_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cv_variants_user_id ON public.cv_variants(user_id);

-- 4. TABELA: job_offers (Rejestr ofert pracy ze zintegrowanymi danymi kontaktowymi)
CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cv_variant_id UUID REFERENCES public.cv_variants(id) ON DELETE SET NULL,

    -- Dane podstawowe
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    is_cv_sent BOOLEAN DEFAULT false NOT NULL,
    status recruitment_status_type DEFAULT 'saved' NOT NULL,

    -- Dane firmy i kontakty
    company_name TEXT NOT NULL,
    company_address TEXT,
    contact_phone TEXT,
    contact_email TEXT,

    -- Szczegóły oferty
    source_url TEXT,
    work_mode work_mode_type DEFAULT 'remote',
    salary_range TEXT,
    requirements TEXT,
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_job_offers_user_created ON public.job_offers(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_offers_status ON public.job_offers(user_id, status);
CREATE INDEX IF NOT EXISTS idx_job_offers_category ON public.job_offers(user_id, category);
CREATE INDEX IF NOT EXISTS idx_job_offers_is_cv_sent ON public.job_offers(user_id, is_cv_sent);
CREATE INDEX IF NOT EXISTS idx_job_offers_company_name ON public.job_offers(user_id, lower(company_name));

-- 5. TABELA: offer_status_history (Historia zmian statusów)
CREATE TABLE IF NOT EXISTS public.offer_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status recruitment_status_type NOT NULL,
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_history_offer ON public.offer_status_history(offer_id, created_at DESC);

-- =============================================================================
-- BEZPIECZEŃSTWO: ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_status_history ENABLE ROW LEVEL SECURITY;

-- Polityki dla job_categories
DO $$ BEGIN
    CREATE POLICY "Users can manage own categories"
    ON public.job_categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Polityki dla cv_variants
DO $$ BEGIN
    CREATE POLICY "Users can manage own cv variants"
    ON public.cv_variants FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Polityki dla job_offers
DO $$ BEGIN
    CREATE POLICY "Users can view own offers"
    ON public.job_offers FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can insert own offers"
    ON public.job_offers FOR INSERT
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can update own offers"
    ON public.job_offers FOR UPDATE
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own offers"
    ON public.job_offers FOR DELETE
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Polityki dla offer_status_history
DO $$ BEGIN
    CREATE POLICY "Users can manage own status history"
    ON public.offer_status_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- STORAGE BUCKET: resumes (Przechowywanie plików PDF z CV)
-- =============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
    CREATE POLICY "Users can upload own CV to resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'resumes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can read own CV from resumes"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'resumes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE POLICY "Users can delete own CV from resumes"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'resumes'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================================================
-- UPRAWNIENIA TABEL (GRANT) DLA RÓL SUPABASE
-- =============================================================================
-- Wymagane przez PostgreSQL przed ewaluacją polityk RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.cv_variants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_offers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.offer_status_history TO anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

