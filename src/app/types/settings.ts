export type Language = "en" | "fr" | "es";

export interface VisibleColumns {
  date: boolean;
  startTime: boolean;
  endTime: boolean;
  duration: boolean;
  title: boolean;
  description: boolean;
  guests: boolean;
  location: boolean;
  monthNumber: boolean;
  weekNumber: boolean;
}

export interface AppSettings {
  dateFormat: string;
  durationPrecision: 1 | 2;
  defaultCalendars: string[];
  autoCopy: boolean;
  bwMode: boolean;
  darkMode: boolean;
  excludedKeywords: string[];
  language: Language;
  weekStartsOn: 0 | 1;
  visibleColumns: VisibleColumns;
  includeAllDay: boolean;
  allDayHours: number;
  copyWithHeaders: boolean;
}

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
