"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, LogOut, Rows3, Search, Settings, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { Dashboard } from "@/components/Dashboard";
import { SettingsModal } from "@/components/SettingsModal";
import { useSettings } from "@/hooks/useSettings";

interface AppShellProps {
  user: { name?: string | null; image?: string | null };
}

/** The signed-in frame: top bar plus the dashboard. Also owns the UI state the bar controls. */
export function AppShell({ user }: AppShellProps) {
  const { t } = useSettings();
  const [compact, setCompact] = useState(false);
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center gap-6">
            <div className="flex w-72 flex-shrink-0 items-center gap-3">
              <Calendar className="h-6 w-6 text-accent" aria-hidden />
              <span className="text-xl font-bold tracking-tight">{t("appName")}</span>
            </div>

            <div className="relative">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3"
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchEvents")}
                aria-label={t("searchEvents")}
                className="w-96 rounded-lg border border-line bg-canvas py-1.5 pl-8 pr-7 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent [&::-webkit-search-cancel-button]:hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t("clear")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setCompact((value) => !value)}
              title={compact ? t("switchToDefault") : t("switchToCompact")}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                compact ? "text-ink" : "text-ink-3 hover:text-ink"
              }`}
            >
              <Rows3 className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">
                {t("compactIs")} {compact ? t("on") : t("off")}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              title={t("settings")}
              className="flex items-center gap-1.5 text-sm text-ink-3 transition-colors hover:text-ink"
            >
              <Settings className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{t("settings")}</span>
            </button>

            <div className="flex items-center gap-3 rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-ink-2">
              {user.image && (
                <Image
                  src={user.image}
                  alt=""
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 rounded-full"
                />
              )}
              {user.name}
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              title={t("signOut")}
              className="flex items-center gap-2 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
            >
              <LogOut className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">{t("signOut")}</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Dashboard compact={compact} search={search} onOpenSettings={() => setSettingsOpen(true)} />
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
