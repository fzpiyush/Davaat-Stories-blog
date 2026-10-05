"use server";

import { cookies, headers } from "next/headers";
import { z } from "zod";

import { SESSION_COOKIE } from "@/lib/auth/cookies";
import {
  getCurrentSession,
  invalidateSession,
  isAdminUser,
} from "@/lib/auth/session";
import {
  getLikeState,
  getLiveChapterStoryId,
  isTargetLive,
  recordBlogView,
  recordChapterView,
  toggleLikeRecord,
} from "@/lib/db/engagement";
import type { LikeState, Viewer } from "@/lib/engagement/types";
import { ensureVisitorHash, readVisitorHash } from "@/lib/engagement/visitor";

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|monitor/i;

const viewSchema = z.object({
  kind: z.enum(["blog", "chapter"]),
  id: z.uuid(),
});

const likeSchema = z.object({
  kind: z.enum(["blog", "story"]),
  id: z.uuid(),
});

export type LikeResult =
  | { ok: true; state: LikeState }
  | { ok: false; message: string };

export async function getViewer(): Promise<Viewer | null> {
  const { user } = await getCurrentSession();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name ?? user.email.split("@")[0],
    avatarUrl: user.avatar_url,
    isAdmin: isAdminUser(user),
    isBlocked: user.is_blocked,
  };
}

/* The browser reloads afterwards, so every part of the page updates */
export async function signOutViewer(): Promise<void> {
  const { session } = await getCurrentSession();

  if (session) {
    await invalidateSession(session.id);
  }

  (await cookies()).delete(SESSION_COOKIE);
}

/* Bots and your own admin visits never count */
export async function recordView(input: unknown): Promise<void> {
  const parsed = viewSchema.safeParse(input);

  if (!parsed.success) {
    return;
  }

  const userAgent = (await headers()).get("user-agent") ?? "";

  if (!userAgent || BOT_PATTERN.test(userAgent)) {
    return;
  }

  const viewer = await getViewer();

  if (viewer?.isAdmin) {
    return;
  }

  try {
    const { kind, id } = parsed.data;

    if (kind === "blog") {
      if (await isTargetLive("blog", id)) {
        await recordBlogView(id, await ensureVisitorHash());
      }

      return;
    }

    const storyId = await getLiveChapterStoryId(id);

    if (storyId) {
      await recordChapterView(storyId, id, await ensureVisitorHash());
    }
  } catch (error) {
    console.error("Recording view failed", error);
  }
}

export async function loadLikeState(input: unknown): Promise<LikeState | null> {
  const parsed = likeSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  try {
    return await getLikeState(
      parsed.data.kind,
      parsed.data.id,
      await readVisitorHash(),
    );
  } catch (error) {
    console.error("Loading likes failed", error);
    return null;
  }
}

export async function toggleLike(input: unknown): Promise<LikeResult> {
  const parsed = likeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "That didn't work. Please refresh and try again.",
    };
  }

  const { kind, id } = parsed.data;

  try {
    if (!(await isTargetLive(kind, id))) {
      return { ok: false, message: "This isn't available anymore." };
    }

    const visitorHash = await ensureVisitorHash();
    await toggleLikeRecord(kind, id, visitorHash);

    return { ok: true, state: await getLikeState(kind, id, visitorHash) };
  } catch (error) {
    console.error("Toggling like failed", error);
    return { ok: false, message: "Couldn't save your like. Please try again." };
  }
}
