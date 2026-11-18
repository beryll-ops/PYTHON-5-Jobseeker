-- =============================================================================
-- MIGRACJA: NADANIE UPRAWNIEŃ DLA RÓL SUPABASE (anon, authenticated, service_role)
-- =============================================================================
-- Naprawia błąd: "permission denied for table job_offers / cv_variants / job_categories"
-- W PostgreSQL uprawnienia tabelowe (GRANT) są sprawdzane przed politykami RLS.
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT ALL ON TABLE public.cv_variants TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_categories TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.job_offers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.offer_status_history TO anon, authenticated, service_role;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
