"use client";

import { Calendar, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useSettings } from "@/hooks/useSettings";

export function SignIn() {
  const { t } = useSettings();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-surface shadow-xl">
        <div className="bg-accent p-8 text-center text-accent-ink">
          <Calendar className="mx-auto mb-4 h-16 w-16" aria-hidden />
          <h1 className="mb-2 text-3xl font-bold">{t("appName")}</h1>
          <p className="opacity-80">{t("signInDescription")}</p>
        </div>
        <div className="flex flex-col items-center p-8 pb-12 text-center">
          <button
            type="button"
            onClick={() => signIn("google")}
            className="flex items-center gap-3 rounded-full bg-primary px-8 py-4 font-semibold text-primary-ink shadow-md transition hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg"
          >
            <LogIn className="h-5 w-5" aria-hidden />
            {t("signInWithGoogle")}
          </button>
          <p className="mt-4 text-sm text-ink-3">{t("signInAccess")}</p>
        </div>
      </div>
    </div>
  );
}
