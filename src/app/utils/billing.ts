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
}

export function categorizeEvents(
  rawEvents: calendar_v3.Schema$Event[],
  clients: Client[]
): CategorizedEvent[] {
  return rawEvents
    .filter((event) => event.start?.dateTime && event.end?.dateTime)
    .map((event) => {
      const startTime = new Date(event.start!.dateTime as string);
      const endTime = new Date(event.end!.dateTime as string);
      const durationHours = differenceInMinutes(endTime, startTime) / 60;

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
      };
    });
}
