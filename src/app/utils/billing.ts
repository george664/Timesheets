import { differenceInMinutes } from "date-fns";
import { calendar_v3 } from "googleapis";

export interface Client {
  id: string;
  name: string;
  keywords: string;
}

export interface CategorizedEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  clientId: string | null;
  clientName: string | null;
  htmlLink: string | null;
  organizer: string | null;
  description: string | null;
  location: string | null;
  guests: string[];
}

export function categorizeEvents(
  rawEvents: calendar_v3.Schema$Event[],
  clients: Client[],
  options: { includeAllDay: boolean; allDayHours: number } = { includeAllDay: false, allDayHours: 8 }
): CategorizedEvent[] {
  return rawEvents
    .filter((event) => {
      if (event.start?.dateTime && event.end?.dateTime) return true;
      if (options.includeAllDay && event.start?.date && event.end?.date) return true;
      return false;
    })
    .map((event) => {
      const isAllDay = !event.start?.dateTime;
      let startTime: Date;
      let endTime: Date;
      let durationHours: number;

      if (isAllDay) {
        startTime = new Date(event.start!.date + "T00:00:00");
        endTime = new Date(event.end!.date + "T00:00:00");
        const days = differenceInMinutes(endTime, startTime) / (60 * 24);
        durationHours = days * options.allDayHours;
      } else {
        startTime = new Date(event.start!.dateTime as string);
        endTime = new Date(event.end!.dateTime as string);
        durationHours = differenceInMinutes(endTime, startTime) / 60;
      }

      const title = event.summary || "Untitled Event";
      const description = event.description || "";
      const searchString = `${title} ${description}`.toLowerCase();

      let matchedClient: Client | null = null;

      for (const client of clients) {
        const keywords = client.keywords.split(",").map((k) => k.trim().toLowerCase()).filter((k) => k);
        const hasMatch = keywords.some((keyword) => searchString.includes(keyword));
        if (hasMatch) {
          matchedClient = client;
          break;
        }
      }

      return {
        id: event.id || String(Math.random()),
        title,
        startTime,
        endTime,
        durationHours,
        clientId: matchedClient ? matchedClient.id : null,
        clientName: matchedClient ? matchedClient.name : null,
        htmlLink: event.htmlLink || null,
        organizer: event.organizer?.displayName || event.organizer?.email || event.creator?.displayName || event.creator?.email || null,
        description: event.description || null,
        location: event.location || null,
        guests: (event.attendees || []).filter((a) => !a.self).map((a) => a.displayName || a.email || "").filter(Boolean),
      };
    });
}
