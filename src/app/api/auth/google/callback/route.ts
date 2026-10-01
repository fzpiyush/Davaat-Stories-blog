import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth/cookies";
import { getAuthConfig } from "@/lib/auth/env";
import type { LoginErrorCode } from "@/lib/auth/errors";
import {
  exchangeCodeForAccessToken,
  fetchGoogleProfile,
} from "@/lib/auth/google";
import { createSession, deleteExpiredSessions } from "@/lib/auth/session";
import { upsertGoogleUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Compares secrets without leaking timing information */
function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

function clearOAuthCookies(response: NextResponse): void {
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.delete(OAUTH_VERIFIER_COOKIE);
}

function redirectToLogin(
  request: NextRequest,
  error: LoginErrorCode,
): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);

  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store");
  clearOAuthCookies(response);

  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = request.nextUrl;
  const googleError = searchParams.get("error");

  if (googleError) {
    return redirectToLogin(
      request,
      googleError === "access_denied" ? "cancelled" : "oauth_failed",
    );
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const codeVerifier = request.cookies.get(OAUTH_VERIFIER_COOKIE)?.value;

  if (
    !code ||
    !state ||
    !storedState ||
    !codeVerifier ||
    !safeEqual(state, storedState)
  ) {
    return redirectToLogin(request, "state_mismatch");
  }

  try {
    const accessToken = await exchangeCodeForAccessToken(code, codeVerifier);
    const profile = await fetchGoogleProfile(accessToken);
    const { adminEmails } = getAuthConfig();
    const email = profile.email.trim().toLowerCase();

    if (!profile.emailVerified || !adminEmails.has(email)) {
      return redirectToLogin(request, "not_allowed");
    }

    const user = await upsertGoogleUser(profile);
    const { token, expiresAt } = await createSession(user.id);

    await deleteExpiredSessions().catch((cleanupError: unknown) => {
      console.error("Expired session cleanup failed", cleanupError);
    });

    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(
      SESSION_COOKIE,
      token,
      sessionCookieOptions(expiresAt),
    );
    clearOAuthCookies(response);

    return response;
  } catch (error) {
    console.error("Google sign in failed", error);
    return redirectToLogin(request, "oauth_failed");
  }
}
