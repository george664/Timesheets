"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "date-fns";
import { getDateLocale, translate, type TranslationKey } from "@/i18n/translations";
import { parseStoredSettings } from "@/lib/settings";
import { readStoredSettings, subscribeToSettings, writeStoredSettings } from "@/lib/settings-store";
import type { AppSettings } from "@/lib/types";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (changes: Partial<AppSettings>) => void;
  /** Translate a key into the current language. */
  t: (key: TranslationKey) => string;
  locale: Locale;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const subscribeToNothing = () => () => {};

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Settings are browser-only, so the server render (and hydration) sees none and
  // the real values arrive right after. `hydrated` lets us hold back the UI until then.
  const stored = useSyncExternalStore(subscribeToSettings, readStoredSettings, () => null);
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);
  const settings = useMemo(() => parseStoredSettings(stored), [stored]);

  // Theme and language are applied to <html> so the whole page follows them, including the sign-in screen.
  // A layout effect, so a dark theme is in place before the first paint rather than flashing light.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.darkMode ? "dark" : "light";
    root.dataset.bw = String(settings.bwMode);
    root.lang = settings.language;
  }, [settings.darkMode, settings.bwMode, settings.language]);

  const updateSettings = useCallback((changes: Partial<AppSettings>) => {
    // Read the latest saved value rather than a render's copy, so quick successive changes don't overwrite each other.
    const current = parseStoredSettings(readStoredSettings());
    writeStoredSettings(JSON.stringify({ ...current, ...changes }));
  }, []);

  // `t` and `locale` change only with the language, so memoized work that uses them isn't redone on every setting.
  const { language } = settings;
  const t = useCallback((key: TranslationKey) => translate(key, language), [language]);
  const locale = useMemo(() => getDateLocale(language), [language]);

  const value = useMemo<SettingsContextValue>(
    () => ({ settings, updateSettings, t, locale }),
    [settings, updateSettings, t, locale],
  );

  // Render nothing until the saved settings are loaded, so the page doesn't flash in the wrong language.
  if (!hydrated) return null;

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside <SettingsProvider>");
  return context;
}
