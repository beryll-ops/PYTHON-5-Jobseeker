import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Endpoint wymiany kodu autoryzacyjnego (PKCE) na sesję użytkownika.
 * Obsługuje powroty z Magic Linków oraz linków aktywacyjnych rejestracji.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // W razie błędu wymiany kodu przekierowujemy na stronę logowania z parametrem błędu
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
