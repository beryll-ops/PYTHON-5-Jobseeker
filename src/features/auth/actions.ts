"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { AuthActionResult } from "./types";

/**
 * Logowanie użytkownika za pomocą adresu e-mail i hasła.
 * Błędy są logowane na serwerze i przekazywane użytkownikowi w czytelnej formie.
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("[Supabase Auth signInWithPassword error]:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });

      if (error.message.includes("Invalid login credentials")) {
        return {
          success: false,
          error: "Niepoprawne dane logowania (błędny e-mail lub hasło). Upewnij się, że użytkownik został utworzony w panelu Supabase.",
        };
      }

      if (error.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: "Adres e-mail nie został potwierdzony. W panelu Supabase w Authentication -> Users zaznacz 'Auto Confirm User' dla tego konta.",
        };
      }

      return {
        success: false,
        error: error.message || "Wystąpił błąd podczas logowania.",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: any) {
    console.error("[Supabase Auth Exception]:", err);
    return {
      success: false,
      error: err?.message || "Błąd połączenia z serwerem autoryzacji.",
    };
  }
}

/**
 * Rejestracja publiczna została zablokowana.
 */
export async function signUpWithPassword(): Promise<AuthActionResult> {
  return {
    success: false,
    error: "Rejestracja jest wyłączona. Nowe konta tworzy administrator.",
  };
}

/**
 * Logowanie bezhasłowe (Magic Link).
 * Flaga shouldCreateUser: false blokuje automatyczne tworzenie kont.
 */
export async function signInWithMagicLink(
  email: string
): Promise<AuthActionResult> {
  try {
    const supabase = await createClient();
    const headerList = await headers();
    const origin = headerList.get("origin") || "";

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: false, // Blokada automatycznego tworzenia kont
      },
    });

    if (error) {
      console.error("[Supabase Auth signInWithMagicLink error]:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });

      const msg = error.message.toLowerCase();
      if (msg.includes("signups not allowed") || msg.includes("user not found")) {
        return {
          success: false,
          error: "Użytkownik o tym adresie e-mail nie istnieje w systemie.",
        };
      }

      return {
        success: false,
        error: error.message || "Nie udało się wysłać linku logującego.",
      };
    }

    return {
      success: true,
      message: "Link logujący został wysłany na Twój adres e-mail.",
    };
  } catch (err: any) {
    console.error("[Supabase MagicLink Exception]:", err);
    return {
      success: false,
      error: err?.message || "Błąd połączenia z serwerem autoryzacji.",
    };
  }
}

/**
 * Wylogowanie zalogowanego użytkownika i unieważnienie ciasteczek sesyjnych.
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
