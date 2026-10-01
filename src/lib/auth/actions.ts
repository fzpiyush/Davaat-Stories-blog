"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { SESSION_COOKIE } from "@/lib/auth/cookies";
import { getCurrentSession, invalidateSession } from "@/lib/auth/session";

export async function signInWithGoogle(): Promise<void> {
  redirect("/api/auth/google");
}

export async function signOut(): Promise<void> {
  const { session } = await getCurrentSession();

  if (session) {
    await invalidateSession(session.id);
  }

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);

  redirect("/login");
}
