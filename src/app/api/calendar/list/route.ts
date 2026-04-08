import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const accessToken = session?.accessToken;

    if (!session || !accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });
    const res = await calendar.calendarList.list();

    const calendars = (res.data.items || []).map((c) => ({
      id: c.id,
      summary: c.summary,
      primary: c.primary || false,
      backgroundColor: c.backgroundColor,
    }));

    return NextResponse.json(calendars);
  } catch (error: any) {
    console.error("Error fetching calendar list:", error);
    return NextResponse.json({ error: "Failed to fetch calendars" }, { status: 500 });
  }
}
