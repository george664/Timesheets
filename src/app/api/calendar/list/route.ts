import { NextResponse, type NextRequest } from "next/server";
import { toCalendarInfo } from "@/lib/calendar";
import { errorResponse, getCalendarClient } from "@/lib/google";
import type { CalendarInfo } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const calendar = await getCalendarClient(request);

    const calendars: CalendarInfo[] = [];
    let pageToken: string | undefined;
    do {
      const { data } = await calendar.calendarList.list({ maxResults: 250, pageToken });
      for (const raw of data.items ?? []) {
        const info = toCalendarInfo(raw);
        if (info) calendars.push(info);
      }
      pageToken = data.nextPageToken ?? undefined;
    } while (pageToken);

    return NextResponse.json({ calendars });
  } catch (error) {
    return errorResponse(error, "fetch calendars");
  }
}
