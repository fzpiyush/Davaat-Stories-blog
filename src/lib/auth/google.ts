import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { getAuthConfig } from "@/lib/auth/env";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  picture: string | null;
};

type TokenResponse = {
  access_token: string;
};

type RawGoogleProfile = {
  sub: string;
  email: string;
  email_verified?: unknown;
  name?: unknown;
  picture?: unknown;
};

export function generateRandomString(): string {
  return randomBytes(32).toString("base64url");
}

function toCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function isTokenResponse(value: unknown): value is TokenResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "access_token" in value &&
    typeof value.access_token === "string"
  );
}

function isRawGoogleProfile(value: unknown): value is RawGoogleProfile {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return typeof record.sub === "string" && typeof record.email === "string";
}

export function createGoogleAuthUrl(state: string, codeVerifier: string): URL {
  const { googleClientId, googleRedirectUri } = getAuthConfig();
  const url = new URL(GOOGLE_AUTH_URL);

  url.search = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    code_challenge: toCodeChallenge(codeVerifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  }).toString();

  return url;
}

export async function exchangeCodeForAccessToken(
  code: string,
  codeVerifier: string,
): Promise<string> {
  const { googleClientId, googleClientSecret, googleRedirectUri } =
    getAuthConfig();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code",
      code_verifier: codeVerifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isTokenResponse(data)) {
    throw new Error("Unexpected token response from Google");
  }

  return data.access_token;
}

export async function fetchGoogleProfile(
  accessToken: string,
): Promise<GoogleProfile> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Google profile request failed with ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isRawGoogleProfile(data)) {
    throw new Error("Unexpected profile response from Google");
  }

  return {
    sub: data.sub,
    email: data.email.toLowerCase(),
    emailVerified: data.email_verified === true,
    name: typeof data.name === "string" ? data.name : null,
    picture: typeof data.picture === "string" ? data.picture : null,
  };
}
