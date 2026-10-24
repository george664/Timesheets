export type Language = "en" | "fr" | "es";

/** A calendar event reduced to the fields the app uses, as returned by /api/calendar/events. */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  /** ISO timestamp for timed events, `yyyy-MM-dd` for all-day events. */
  start: string;
  /** ISO timestamp for timed events, `yyyy-MM-dd` (exclusive) for all-day events. */
  end: string;
  allDay: boolean;
  htmlLink: string | null;
  organizer: string | null;
  guests: string[];
}

/** A calendar the user can pick from, as returned by /api/calendar/list. */
export interface CalendarInfo {
  id: string;
  summary: string;
  primary: boolean;
  backgroundColor: string | null;
}

/** An event with its billable duration resolved (depends on the all-day settings). */
export interface TimedEvent extends CalendarEvent {
  startDate: Date;
  endDate: Date;
  hours: number;
  /** The `Prefix:` at the start of the title, if any. */
  category: string | null;
  /** The title without its `Prefix: `. */
  displayTitle: string;
}

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
  /** Calendar ids. `"primary"` is Google's alias for the signed-in user's main calendar. */
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
