"use client";

import { useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, Calendar, Settings, Rows3, Search, X } from "lucide-react";
import { Dashboard } from "@/app/components/Dashboard";
import { SettingsProvider, useSettings } from "@/app/contexts/SettingsContext";
import { SettingsModal } from "@/app/components/SettingsModal";
import { t } from "@/app/i18n/translations";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-500 animate-pulse">{t("loading", "en")}</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center">
            <Calendar className="w-16 h-16 text-white mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">{t("billingSync", "en")}</h1>
            <p className="text-indigo-200">{t("signInDescription", "en")}</p>
          </div>
          <div className="p-8 pb-12 text-center flex flex-col items-center">
            <button
              onClick={() => signIn("google")}
              className="flex items-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <LogIn className="w-5 h-5" />
              {t("signInWithGoogle", "en")}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              {t("signInAccess", "en")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <HomeContent session={session} />
    </SettingsProvider>
  );
}

function HomeContent({ session }: { session: any }) {
  const { settings, compact, setCompact, searchQuery, setSearchQuery } = useSettings();
  const lang = settings.language;
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 ${settings.bwMode ? "bw-mode" : ""} ${settings.darkMode ? "dark-mode" : ""}`}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center gap-3 w-72 flex-shrink-0">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <span className="font-bold text-xl tracking-tight">{t("billingSync", lang)}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("searchEvents", lang)}
                  className="w-96 pl-8 pr-7 py-1.5 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCompact((p) => !p)}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  compact ? "text-gray-900" : "text-gray-400 hover:text-gray-600"
                }`}
                title={compact ? t("switchToDefault", lang) : t("switchToCompact", lang)}
              >
                <Rows3 className="w-4 h-4" />
                <span className="hidden sm:inline">{t("compactIs", lang)} {compact ? t("on", lang) : t("off", lang)}</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                title={t("settings", lang)}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{t("settings", lang)}</span>
              </button>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-full px-4 py-1.5">
                {session.user?.image && (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                {session.user?.name}
              </div>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                title={t("signOut", lang)}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{t("signOut", lang)}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Dashboard onOpenSettings={() => setShowSettings(true)} />
      </main>

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
