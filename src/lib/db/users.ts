import "server-only";

import type { GoogleProfile } from "@/lib/auth/google";
import { db } from "@/lib/db/knex";
import type { UserRow } from "@/lib/db/types";

export async function upsertGoogleUser(
  profile: GoogleProfile,
): Promise<UserRow> {
  const now = new Date();

  const [user] = await db<UserRow>("users")
    .insert({
      google_id: profile.sub,
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
      role: "admin",
      last_login_at: now,
    })
    .onConflict("google_id")
    .merge({
      email: profile.email,
      name: profile.name,
      avatar_url: profile.picture,
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
