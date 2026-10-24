import { differenceInCalendarDays, differenceInMinutes, parseISO } from "date-fns";
import type { CalendarEvent, TimedEvent } from "./types";

export interface DurationOptions {
  includeAllDay: boolean;
  allDayHours: number;
}

/** Matches the `Prefix: ` convention used to categorize events, e.g. `UWCC: Weekly sync`. */
const CATEGORY_PATTERN = /^(\S+):\s/;

export function splitTitle(title: string): { category: string | null; displayTitle: string } {
  const match = title.match(CATEGORY_PATTERN);
  if (!match) return { category: null, displayTitle: title };
  return { category: match[1], displayTitle: title.slice(match[0].length) };
}

/**
 * Resolve dates, billable hours and category for each event. All-day events are
 * dropped unless `includeAllDay` is on, in which case each day counts as `allDayHours`.
 */
export function toTimedEvents(events: CalendarEvent[], options: DurationOptions): TimedEvent[] {
  const result: TimedEvent[] = [];

  for (const event of events) {
    if (event.allDay && !options.includeAllDay) continue;

    const startDate = parseISO(event.start);
    const endDate = parseISO(event.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) continue;

    const hours = event.allDay
      ? differenceInCalendarDays(endDate, startDate) * options.allDayHours
      : differenceInMinutes(endDate, startDate) / 60;

    result.push({ ...event, startDate, endDate, hours, ...splitTitle(event.title) });
  }

  return result;
}

export interface EventFilters {
  /** A category name, or one of the two pseudo-categories below. */
  category: string | null;
  author: string | null;
  years: ReadonlySet<number>;
  months: ReadonlySet<number>;
  excludedKeywords: readonly string[];
  search: string;
}

export const CATEGORIZED = "__categorized__";
export const UNCATEGORIZED = "__uncategorized__";

/** Stands in for events with no organizer; the UI shows a translated label for it. */
export const UNKNOWN_AUTHOR = "__unknown__";

export const authorOf = (event: TimedEvent): string => event.organizer ?? UNKNOWN_AUTHOR;

export function filterEvents(events: TimedEvent[], filters: EventFilters): TimedEvent[] {
  const excluded = filters.excludedKeywords.map((k) => k.toLowerCase());
  const search = filters.search.trim().toLowerCase();

  return events.filter((event) => {
    if (filters.category === UNCATEGORIZED && event.category) return false;
    if (filters.category === CATEGORIZED && !event.category) return false;
    if (filters.category && filters.category !== UNCATEGORIZED && filters.category !== CATEGORIZED) {
      if (event.category !== filters.category) return false;
    }

    if (filters.years.size > 0 && !filters.years.has(event.startDate.getFullYear())) return false;
    if (filters.months.size > 0 && !filters.months.has(event.startDate.getMonth())) return false;

    if (excluded.length > 0) {
      const title = event.title.toLowerCase();
      if (excluded.some((keyword) => title.includes(keyword))) return false;
    }

    if (filters.author && authorOf(event) !== filters.author) return false;

    if (search) {
      if (!event.title.toLowerCase().includes(search)) return false;
    }

    return true;
  });
}

export interface Tally {
  name: string;
  count: number;
  hours: number;
}

function tally(events: TimedEvent[], keyOf: (event: TimedEvent) => string | null): Tally[] {
  const map = new Map<string, Tally>();
  for (const event of events) {
    const name = keyOf(event);
    if (name === null) continue;
    const entry = map.get(name) ?? { name, count: 0, hours: 0 };
    entry.count += 1;
    entry.hours += event.hours;
    map.set(name, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const tallyByCategory = (events: TimedEvent[]) => tally(events, (e) => e.category);

export const tallyByAuthor = (events: TimedEvent[]) => tally(events, authorOf);

export function sumHours(events: TimedEvent[]): number {
  return events.reduce((total, event) => total + event.hours, 0);
}
