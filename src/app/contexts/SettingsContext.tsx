"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "@/app/types/settings";

const STORAGE_KEY = "billing_app_settings";

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  compact: boolean;
  setCompact: React.Dispatch<React.SetStateAction<boolean>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  compact: false,
  setCompact: () => {},
  searchQuery: "",
  setSearchQuery: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [compact, setCompact] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    } else {
      const migrated = { ...DEFAULT_SETTINGS };
      const legacyBw = localStorage.getItem("billing_bw_mode");
      if (legacyBw !== null) {
        migrated.bwMode = legacyBw !== "false";
        localStorage.removeItem("billing_bw_mode");
      }
      const legacyCopy = localStorage.getItem("billing_auto_copy");
      if (legacyCopy !== null) {
        migrated.autoCopy = legacyCopy === "true";
        localStorage.removeItem("billing_auto_copy");
      }
      setSettings(migrated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    setLoaded(true);
  }, []);

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  if (!loaded) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, compact, setCompact, searchQuery, setSearchQuery }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
