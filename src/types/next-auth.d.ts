import "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    /** Access token expiry, in seconds since the epoch. */
    expiresAt?: number;
  }
}
