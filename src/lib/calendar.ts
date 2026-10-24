import type { calendar_v3 } from "googleapis";
import type { CalendarEvent, CalendarInfo } from "./types";

/** Reduce a Google event to the fields the app uses. Returns null for events with no usable times. */
export function toCalendarEvent(raw: calendar_v3.Schema$Event): CalendarEvent | null {
  if (!raw.id || raw.status === "cancelled") return null;

  const allDay = !raw.start?.dateTime && Boolean(raw.start?.date);
  const start = raw.start?.dateTime ?? raw.start?.date;
  const end = raw.end?.dateTime ?? raw.end?.date;
  if (!start || !end) return null;

  return {
    id: raw.id,
    title: raw.summary || "Untitled Event",
    description: raw.description ?? null,
    location: raw.location ?? null,
    start,
    end,
    allDay,
    htmlLink: raw.htmlLink ?? null,
    organizer:
      raw.organizer?.displayName ||
      raw.organizer?.email ||
      raw.creator?.displayName ||
      raw.creator?.email ||
      null,
    guests: (raw.attendees ?? [])
      .filter((attendee) => !attendee.self)
      .map((attendee) => attendee.displayName || attendee.email || "")
      .filter(Boolean),
  };
}

export function toCalendarInfo(raw: calendar_v3.Schema$CalendarListEntry): CalendarInfo | null {
  if (!raw.id) return null;
  return {
    id: raw.id,
    summary: raw.summaryOverride || raw.summary || raw.id,
    primary: raw.primary ?? false,
    backgroundColor: raw.backgroundColor ?? null,
  };
}

/** Only ask Google for the fields we use; descriptions and attendee lists are the heavy parts. */
export const EVENT_FIELDS =
  "nextPageToken,items(id,status,summary,description,location,start,end,htmlLink," +
  "organizer(displayName,email),creator(displayName,email),attendees(displayName,email,self))";
