import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");
    const calendarIds = searchParams.get("calendars")?.split(",").filter(Boolean) || ["primary"];

    if (!timeMin || !timeMax) {
      return NextResponse.json(
        { error: "Missing timeMin or timeMax parameters" },
        { status: 400 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const allEvents = await Promise.all(
      calendarIds.map(async (calId) => {
        const items: any[] = [];
        let pageToken: string | undefined;
        do {
          const response = await calendar.events.list({
            calendarId: calId,
            timeMin: new Date(timeMin).toISOString(),
            timeMax: new Date(timeMax).toISOString(),
            singleEvents: true,
            orderBy: "startTime",
            maxResults: 2500,
            pageToken,
          });
          items.push(...(response.data.items || []));
          pageToken = response.data.nextPageToken ?? undefined;
        } while (pageToken);
        return items;
      })
    );

    // Deduplicate by event ID
    const seen = new Set<string>();
    const events = allEvents.flat().filter((e) => {
      if (!e.id || seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    });

    return NextResponse.json({ events });
  } catch (error: any) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events", details: error.message },
      { status: 500 }
    );
  }
}
