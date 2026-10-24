import type { AppSettings, Language, VisibleColumns } from "./types";

/** Same key the previous version used, so existing settings carry over. */
export const SETTINGS_STORAGE_KEY = "billing_app_settings";

export const DEFAULT_VISIBLE_COLUMNS: VisibleColumns = {
  date: true,
  startTime: false,
  endTime: false,
  duration: true,
  title: true,
  description: false,
  guests: false,
  location: false,
  monthNumber: false,
  weekNumber: false,
};

export const DEFAULT_SETTINGS: AppSettings = {
  dateFormat: "EEE, MMM dd, yyyy",
  durationPrecision: 1,
  defaultCalendars: ["primary"],
  autoCopy: false,
  bwMode: false,
  darkMode: false,
  excludedKeywords: [],
  language: "en",
  weekStartsOn: 0,
  visibleColumns: DEFAULT_VISIBLE_COLUMNS,
  includeAllDay: false,
  allDayHours: 8,
  copyWithHeaders: true,
};

export const DATE_FORMAT_OPTIONS = [
  { value: "EEE, MMM dd, yyyy", example: "Tue, Mar 31, 2026" },
  { value: "yyyy-MM-dd", example: "2026-03-31" },
  { value: "dd/MM/yyyy", example: "31/03/2026" },
  { value: "MM/dd/yyyy", example: "03/31/2026" },
] as const;

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];

/** Merge whatever was stored with the defaults, so new settings get sane values. */
export function parseStoredSettings(raw: string | null): AppSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings> | null;
    if (!parsed || typeof parsed !== "object") return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      visibleColumns: { ...DEFAULT_VISIBLE_COLUMNS, ...parsed.visibleColumns },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
