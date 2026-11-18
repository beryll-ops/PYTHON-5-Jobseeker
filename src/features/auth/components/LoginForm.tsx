"use client";

import React, { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  signInWithPassword,
  signInWithMagicLink,
} from "@/features/auth/actions";
import type { AuthMode } from "@/features/auth/types";
import { AuthTabs } from "./AuthTabs";
import { cn } from "@/lib/utils";

export interface LoginFormProps {
  isCosmic?: boolean;
}

/**
 * Komponent logowania do aplikacji.
 * Wizualnie stylizowany w palecie głębokiego obsydianu z żółto-złotym akcentem.
 */
export function LoginForm({ isCosmic = false }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/";

  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("Podaj adres e-mail.");
      return;
    }

    if (mode === "signin" && !password) {
      setErrorMsg("Wprowadź hasło.");
      return;
    }

    startTransition(async () => {
      if (mode === "signin") {
        const res = await signInWithPassword(email, password);
        if (res.success) {
          router.push(redirectTo);
          router.refresh();
        } else {
          setErrorMsg(res.error || "Niepoprawny login lub hasło.");
        }
      } else if (mode === "magic-link") {
        const res = await signInWithMagicLink(email);
        if (res.success) {
          setSuccessMsg(
            res.message || "Wysłano wiadomość z linkiem logującym."
          );
        } else {
          setErrorMsg(res.error || "Nie udało się zrealizować żądania.");
        }
      }
    });
  };

  const inputClass =
    "w-full bg-zinc-900/90 border border-zinc-700/80 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 transition-colors shadow-inner";

  return (
    <div
      className={cn(
        "w-full max-w-md mx-auto p-6 sm:p-8 space-y-6 shadow-2xl relative",
        isCosmic
          ? "bg-[#09090d] border border-yellow-500/35 text-slate-200 shadow-[0_0_35px_rgba(234,179,8,0.12)]"
          : "bg-zinc-950/95 border border-yellow-500/25 text-zinc-200 rounded-2xl shadow-[0_0_35px_rgba(0,0,0,0.85)]"
      )}
      style={
        isCosmic
          ? {
              clipPath:
                "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%)",
            }
          : undefined
      }
    >
      {/* Nagłówek logowania */}
      <div className="text-center space-y-2">
        <div
          className={cn(
            "inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-sm mb-1 font-mono shadow-[0_0_20px_rgba(250,204,21,0.35)]",
            "bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-zinc-950"
          )}
          style={
            isCosmic
              ? { clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }
              : undefined
          }
        >
          P5
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Zaloguj się do <span className="text-yellow-400">JobSeeker</span>
        </h1>
        <p className="text-xs text-zinc-400">
          Centrum operacyjne ofert pracy i wariantów CV.
        </p>
      </div>

      {/* Wybór metody logowania */}
      <AuthTabs
        mode={mode}
        onSelectMode={(selected) => {
          setMode(selected);
          setErrorMsg(null);
          setSuccessMsg(null);
        }}
      />

      {/* Komunikaty */}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-xs">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 text-xs">
          {successMsg}
        </div>
      )}

      {/* Formularz */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Twój adres e-mail *"
            required
            className={inputClass}
          />
        </div>

        {mode === "signin" && (
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Hasło *"
              required
              className={inputClass}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full py-2.5 font-black text-xs uppercase tracking-wider transition-all",
            isCosmic
              ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 text-zinc-950 hover:shadow-[0_0_24px_rgba(250,204,21,0.5)] active:scale-[0.99]"
              : "bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-lg shadow-[0_0_18px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.45)]"
          )}
          style={
            isCosmic
              ? {
                  clipPath:
                    "polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)",
                }
              : undefined
          }
        >
          {isPending
            ? "Logowanie..."
            : mode === "signin"
            ? "Zaloguj się"
            : "Wyślij Magic Link"}
        </button>
      </form>
    </div>
  );
}
