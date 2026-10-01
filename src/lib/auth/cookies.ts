import "server-only";

export {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE,
} from "@/lib/auth/constants";

type CookieOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge?: number;
  expires?: Date;
};

const isProduction = process.env.NODE_ENV === "production";

const baseOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
} as const satisfies CookieOptions;

export const oauthCookieOptions: CookieOptions = {
  ...baseOptions,
  maxAge: 60 * 10,
};

export function sessionCookieOptions(expiresAt: Date): CookieOptions {
  return { ...baseOptions, expires: expiresAt };
}
