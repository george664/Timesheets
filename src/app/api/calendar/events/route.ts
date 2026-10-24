import { NextResponse, type NextRequest } from "next/server";
import { EVENT_FIELDS, toCalendarEvent } from "@/lib/calendar";
import { errorResponse, getCalendarClient } from "@/lib/google";
import type { CalendarEvent } from "@/lib/types";

const MAX_CALENDARS = 25;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const timeMin = new Date(params.get("timeMin") ?? "");
  const timeMax = new Date(params.get("timeMax") ?? "");

  if (Number.isNaN(timeMin.getTime()) || Number.isNaN(timeMax.getTime())) {
    return NextResponse.json({ error: "timeMin and timeMax must be valid timestamps" }, { status: 400 });
  }

  const requested = (params.get("calendars") ?? "").split(",").filter(Boolean);
  const calendarIds = requested.length > 0 ? requested.slice(0, MAX_CALENDARS) : ["primary"];

  try {
    const calendar = await getCalendarClient(request);

    const perCalendar = await Promise.all(
      calendarIds.map(async (calendarId) => {
        const items: CalendarEvent[] = [];
        let pageToken: string | undefined;
        do {
          const { data } = await calendar.events.list({
            calendarId,
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 2500,
            fields: EVENT_FIELDS,
            pageToken,
          });
          for (const raw of data.items ?? []) {
            const event = toCalendarEvent(raw);
            if (event) items.push(event);
          }
          pageToken = data.nextPageToken ?? undefined;
        } while (pageToken);
        return items;
      }),
    );

    // An event shared between calendars shows up in each of them; keep one copy.
    const seen = new Set<string>();
    const events = perCalendar.flat().filter((event) => {
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    });

    return NextResponse.json({ events });
  } catch (error) {
    return errorResponse(error, "fetch calendar events");
  }
}
