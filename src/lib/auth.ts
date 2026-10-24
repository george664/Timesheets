import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

/**
 * Google sign-in. The tokens stay in the encrypted session cookie and are only
 * read on the server (see lib/google.ts); they are never put on the client session.
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: `openid email profile ${CALENDAR_SCOPE}`,
          // Ask for a refresh token so the API can keep working after the access token expires.
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token ?? token.refreshToken;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
