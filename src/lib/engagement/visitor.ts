import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

const VISITOR_COOKIE = "di_visitor";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const VISITOR_PATTERN = /^[A-Za-z0-9_-]{32,64}$/;

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

/* Reads the visitor cookie without creating one */
export async function readVisitorHash(): Promise<string | null> {
  const value = (await cookies()).get(VISITOR_COOKIE)?.value;
  return value && VISITOR_PATTERN.test(value) ? hash(value) : null;
}

/* Creates the cookie on first use. Only works inside server actions */
export async function ensureVisitorHash(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(VISITOR_COOKIE)?.value;

  if (existing && VISITOR_PATTERN.test(existing)) {
    return hash(existing);
  }

  const value = randomBytes(24).toString("base64url");

  cookieStore.set(VISITOR_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });

  return hash(value);
}
