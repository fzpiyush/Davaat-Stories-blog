import "server-only";

import type { GoogleProfile } from "@/lib/auth/google";
import { db } from "@/lib/db/knex";
import type { UserRole, UserRow } from "@/lib/db/types";

/*
 * Role is refreshed on every login, so adding or removing an
 * email from ADMIN_EMAILS takes effect the next time they sign in.
 */
export async function upsertGoogleUser(
  profile: GoogleProfile,
  role: UserRole,
): Promise<UserRow> {
  const now = new Date();

  const [user] = await db<UserRow>("users")
    .insert({
      google_id: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      role,
      last_login_at: now,
    })
    .onConflict("google_id")
    .merge({
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      role,
      last_login_at: now,
      updated_at: now,
    })
    .returning("*");

  if (!user) {
    throw new Error("Failed to save user");
  }

  return user;
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  return db<UserRow>("users").where({ id }).first();
}
