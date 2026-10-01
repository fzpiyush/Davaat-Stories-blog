import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { getAuthConfig } from "@/lib/auth/env";
import { db } from "@/lib/db/knex";
import type { SessionRow, UserRow } from "@/lib/db/types";
import { getUserById } from "@/lib/db/users";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export type SessionResult =
  | { session: SessionRow; user: UserRow }
  | { session: null; user: null };

const EMPTY_SESSION: SessionResult = { session: null, user: null };

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(
  userId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await db<SessionRow>("sessions").insert({
    id: hashToken(token),
    user_id: userId,
    expires_at: expiresAt,
  });

  return { token, expiresAt };
}

export async function validateSessionToken(
  token: string,
): Promise<SessionResult> {
  const sessionId = hashToken(token);
  const session = await db<SessionRow>("sessions")
    .where({ id: sessionId })
    .first();

  if (!session) {
    return EMPTY_SESSION;
  }

  if (session.expires_at.getTime() <= Date.now()) {
    await invalidateSession(sessionId);
    return EMPTY_SESSION;
  }

  const user = await getUserById(session.user_id);

  if (!user) {
    return EMPTY_SESSION;
  }

  return { session, user };
}

export async function invalidateSession(sessionId: string): Promise<void> {
  await db<SessionRow>("sessions").where({ id: sessionId }).delete();
}

export const getCurrentSession = cache(async (): Promise<SessionResult> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return EMPTY_SESSION;
  }

  return validateSessionToken(token);
});

export async function requireAdmin(): Promise<{
  session: SessionRow;
  user: UserRow;
}> {
  const { session, user } = await getCurrentSession();
  const { adminEmails } = getAuthConfig();

  if (
    !session ||
    !user ||
    user.role !== "admin" ||
    !adminEmails.has(user.email)
  ) {
    redirect("/login");
  }

  return { session, user };
}

export async function deleteExpiredSessions(): Promise<number> {
  return db<SessionRow>("sessions")
    .where("expires_at", "<=", new Date())
    .delete();
}
