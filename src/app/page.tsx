"use client";

import { useSession } from "next-auth/react";
import { AppShell } from "@/components/AppShell";
import { SignIn } from "@/components/SignIn";
import { useSettings } from "@/hooks/useSettings";

export default function Home() {
  const { data: session, status } = useSession();
  const { t } = useSettings();

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="animate-pulse text-xl text-ink-3">{t("loading")}</p>
      </div>
    );
  }

  if (!session) return <SignIn />;

  return <AppShell user={session.user ?? {}} />;
}
