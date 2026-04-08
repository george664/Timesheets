export type Language = "en" | "fr" | "es";

export interface AppSettings {
  dateFormat: string;
  durationPrecision: 1 | 2;
  defaultCalendars: string[];
  autoCopy: boolean;
  bwMode: boolean;
  excludedKeywords: string[];
  language: Language;
}

export const DEFAULT_SETTINGS: AppSettings = {
  dateFormat: "EEE, MMM dd, yyyy",
  durationPrecision: 1,
  defaultCalendars: ["primary"],
  autoCopy: false,
  bwMode: true,
  excludedKeywords: [],
  language: "en",
};

export const DATE_FORMAT_OPTIONS = [
  { value: "EEE, MMM dd, yyyy", label: "Tue, Mar 31, 2026" },
  { value: "yyyy-MM-dd", label: "2026-03-31" },
  { value: "dd/MM/yyyy", label: "31/03/2026" },
  { value: "MM/dd/yyyy", label: "03/31/2026" },
];

export const LANGUAGE_OPTIONS: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
];
