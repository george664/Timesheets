"use client";

import { useEffect, useState } from "react";
import type { CalendarInfo } from "@/lib/types";

/** The user's calendars, loaded once. Failing quietly is fine: the primary calendar still works. */
export function useCalendars() {
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);

  useEffect(() => {
    const abort = new AbortController();

    fetch("/api/calendar/list", { signal: abort.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { calendars: CalendarInfo[] } | null) => {
        if (data) setCalendars(data.calendars);
      })
      .catch(() => {});

    return () => abort.abort();
  }, []);

  return calendars;
}

/** Whether a calendar is ticked. `"primary"` is Google's alias for the main calendar. */
export function isCalendarSelected(calendar: CalendarInfo, selected: string[]): boolean {
  return selected.includes(calendar.id) || (calendar.primary && selected.includes("primary"));
}

/** The selection after ticking or unticking a calendar. */
export function toggleCalendar(calendar: CalendarInfo, selected: string[]): string[] {
  if (isCalendarSelected(calendar, selected)) {
    return selected.filter((id) => id !== calendar.id && !(calendar.primary && id === "primary"));
  }
  return [...selected, calendar.id];
}
