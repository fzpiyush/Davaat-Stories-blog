import { NextResponse, type NextRequest } from "next/server";

import {
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
  oauthCookieOptions,
} from "@/lib/auth/cookies";
import type { LoginErrorCode } from "@/lib/auth/errors";
import { createGoogleAuthUrl, generateRandomString } from "@/lib/auth/google";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function redirectToLogin(
  request: NextRequest,
  error: LoginErrorCode,
): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);

  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const state = generateRandomString();
    const codeVerifier = generateRandomString();
    const authUrl = createGoogleAuthUrl(state, codeVerifier);

    const response = NextResponse.redirect(authUrl);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(OAUTH_STATE_COOKIE, state, oauthCookieOptions);
    response.cookies.set(
      OAUTH_VERIFIER_COOKIE,
      codeVerifier,
      oauthCookieOptions,
    );

    return response;
  } catch (error) {
    console.error("Could not start Google sign in", error);
    return redirectToLogin(request, "oauth_failed");
  }
}
