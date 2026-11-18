-- =================================================================
-- Jobseeker Hub - Kompletny Schemat Bazy Danych PostgreSQL (Supabase)
-- Wklej tę zawartość do Supabase -> SQL Editor i kliknij "Run"
-- =================================================================

-- 1. Typy wyliczeniowe (ENUM)
DO $$ BEGIN
    CREATE TYPE work_mode_type AS ENUM ('remote', 'hybrid', 'onsite');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE recruitment_status_type AS ENUM (
        'saved',           -- Do przejrzenia
        'applied',         -- Zaaplikowano (CV wysłane)
        'contacted',       -- Rekruter się skontaktował (telefon/mail)
        'interview',       -- Rozmowa rekrutacyjna / techniczna
        'task',            -- Zadanie rekrutacyjne
        'offer_received',  -- Złożono ofertę zatrudnienia
        'rejected',        -- Odrzucona przez firmę / brak odpowiedzi
        'archived'         -- Zarchiwizowana przez użytkownika
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Tabela wariantów CV
CREATE TABLE IF NOT EXISTS public.cv_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,                     
    file_path TEXT,                         
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cv_variants_user_id ON public.cv_variants(user_id);

-- 2b. Tabela kategorii pracy (definiowanych per użytkownik)
CREATE TABLE IF NOT EXISTS public.job_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_job_categories_user_id ON public.job_categories(user_id);

-- 3. Tabela ofert pracy (ze spłaszczonymi danymi firm)
CREATE TABLE IF NOT EXISTS public.job_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cv_variant_id UUID REFERENCES public.cv_variants(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    category TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_address TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    source_url TEXT,
    is_cv_sent BOOLEAN DEFAULT false NOT NULL,
    status recruitment_status_type DEFAULT 'saved' NOT NULL,
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

-- 4. Tabela historii statusów
CREATE TABLE IF NOT EXISTS public.offer_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES public.job_offers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status recruitment_status_type NOT NULL,
    comment TEXT,
    changed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_offer_history_offer_id ON public.offer_status_history(offer_id);

-- 5. Włączenie Row Level Security (RLS)
ALTER TABLE public.cv_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_status_history ENABLE ROW LEVEL SECURITY;

-- 6. Polityki RLS dla cv_variants
DROP POLICY IF EXISTS "Users can manage their own CV variants" ON public.cv_variants;
CREATE POLICY "Users can manage their own CV variants"
    ON public.cv_variants FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6b. Polityki RLS dla job_categories
DROP POLICY IF EXISTS "Users can manage their own job categories" ON public.job_categories;
CREATE POLICY "Users can manage their own job categories"
    ON public.job_categories FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Polityki RLS dla job_offers
DROP POLICY IF EXISTS "Users can manage their own job offers" ON public.job_offers;
CREATE POLICY "Users can manage their own job offers"
    ON public.job_offers FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Polityki RLS dla offer_status_history
DROP POLICY IF EXISTS "Users can manage their own status history" ON public.offer_status_history;
CREATE POLICY "Users can manage their own status history"
    ON public.offer_status_history FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Inicjalizacja bucketu Supabase Storage dla wariantów CV (resumes)
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users can upload their own resumes" ON storage.objects;
CREATE POLICY "Users can upload their own resumes"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can view and download their own resumes" ON storage.objects;
CREATE POLICY "Users can view and download their own resumes"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users can delete their own resumes" ON storage.objects;
CREATE POLICY "Users can delete their own resumes"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 10. Uprawnienia tabel (GRANT) dla ról Supabase (anon, authenticated, service_role)
-- PostgreSQL wymaga jawnego GRANT przed ewaluacją polityk RLS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.cv_variants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_offers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.offer_status_history TO anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;

