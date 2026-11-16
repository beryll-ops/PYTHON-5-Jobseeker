import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Klient Supabase działający po stronie przeglądarki (Client Components).
 * Wykorzystuje publiczne zmienne środowiskowe NEXT_PUBLIC_SUPABASE_URL i ANON_KEY.
 */
export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  return createBrowserClient(supabaseUrl, supabaseKey) as unknown as SupabaseClient<Database>;
}
