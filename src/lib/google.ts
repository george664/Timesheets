import { google } from "googleapis";
import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

/** The request has no usable Google session, or Google rejected it. The user must sign in again. */
export class ReauthRequiredError extends Error {
  constructor() {
    super("Google sign-in required");
  }
}

/**
 * A Calendar client acting as the signed-in user. The OAuth client refreshes an
 * expired access token on its own using the stored refresh token.
 */
export async function getCalendarClient(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.accessToken) throw new ReauthRequiredError();

  const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
    expiry_date: token.expiresAt ? token.expiresAt * 1000 : undefined,
  });

  return google.calendar({ version: "v3", auth });
}

function isAuthFailure(error: unknown): boolean {
  if (error instanceof ReauthRequiredError) return true;
  const { status, code, message } = error as { status?: number; code?: number | string; message?: string };
  return status === 401 || code === 401 || code === "401" || /invalid_grant|invalid_token/i.test(message ?? "");
}

/** Turn a failure into a JSON response without leaking Google's error details to the browser. */
export function errorResponse(error: unknown, what: string) {
  if (isAuthFailure(error)) {
    return NextResponse.json({ error: "reauth_required" }, { status: 401 });
  }
  console.error(`Failed to ${what}:`, error);
  return NextResponse.json({ error: `Failed to ${what}` }, { status: 502 });
}
