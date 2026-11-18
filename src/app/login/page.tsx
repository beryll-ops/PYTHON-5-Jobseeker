import React, { Suspense } from "react";
import { cookies } from "next/headers";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobseeker-theme")?.value || "zinc";
  const isCosmic = theme === "cosmic";

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-zinc-500 font-mono text-xs">Ładowanie...</div>}>
        <LoginForm isCosmic={isCosmic} />
      </Suspense>
    </div>
  );
}
