"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { rangeToTimestamps } from "@/lib/dates";
import type { CalendarEvent } from "@/lib/types";

export type FetchError = "reauth" | "failed";

/**
 * Loads events for a date range. A newer request cancels the one before it,
 * so a slow response can never overwrite fresher results.
 */
export function useCalendarEvents(calendarIds: string[]) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FetchError | null>(null);
  /** True once a request has succeeded, so "nothing found" can be told apart from "nothing fetched yet". */
  const [loaded, setLoaded] = useState(false);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => () => controller.current?.abort(), []);

  const load = useCallback(
    async (start: string, end: string) => {
      controller.current?.abort();
      const abort = new AbortController();
      controller.current = abort;

      setLoading(true);
      setError(null);

      try {
        const { timeMin, timeMax } = rangeToTimestamps(start, end);
        const query = new URLSearchParams({ timeMin, timeMax, calendars: calendarIds.join(",") });
        const response = await fetch(`/api/calendar/events?${query}`, { signal: abort.signal });

        if (response.status === 401) {
          setError("reauth");
          return;
        }
        if (!response.ok) throw new Error(`Request failed with ${response.status}`);

        const data = (await response.json()) as { events: CalendarEvent[] };
        setEvents(data.events);
        setLoaded(true);
      } catch (cause) {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError("failed");
      } finally {
        if (controller.current === abort) setLoading(false);
      }
    },
    [calendarIds],
  );

  const clear = useCallback(() => {
    controller.current?.abort();
    setEvents([]);
    setLoaded(false);
    setError(null);
    setLoading(false);
  }, []);

  return { events, loading, loaded, error, load, clear };
}
