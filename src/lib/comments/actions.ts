"use server";

import { z } from "zod";

import { isTargetLive, targetColumn } from "@/lib/db/engagement";
import {
  countRecentComments,
  getOwnComment,
  getReplyTarget,
  insertComment,
  listPublicComments,
  removeOwnComment,
  updateCommentBody,
} from "@/lib/db/publicComments";
import { getViewer } from "@/lib/engagement/actions";
import { COMMENT_MAX_LENGTH } from "@/lib/engagement/signIn";
import type {
  ActionResult,
  CommentsPayload,
  Viewer,
} from "@/lib/engagement/types";

const RATE_LIMIT_COUNT = 5;
const RATE_LIMIT_SECONDS = 60;
const GENERIC_ERROR = "Something went wrong. Please try again.";

const bodySchema = z
  .string()
  .trim()
  .min(1, "Write something first")
  .max(COMMENT_MAX_LENGTH, "Keep comments under 2,000 characters");

const targetSchema = z.object({
  kind: z.enum(["blog", "story"]),
  targetId: z.uuid(),
});

const createSchema = targetSchema.extend({
  parentId: z.uuid().nullable(),
  body: bodySchema,
});

const updateSchema = z.object({
  id: z.uuid(),
  body: bodySchema,
});

const deleteSchema = z.object({
  id: z.uuid(),
});

function fail(message: string): ActionResult {
  return { ok: false, message };
}

function firstIssue(error: z.ZodError): string {
  return error.issues[0]?.message ?? GENERIC_ERROR;
}

async function getCommenter(): Promise<
  { viewer: Viewer } | { message: string }
> {
  const viewer = await getViewer();

  if (!viewer) {
    return { message: "Sign in to comment." };
  }

  if (viewer.isBlocked) {
    return { message: "Commenting is turned off for your account." };
  }

  return { viewer };
}

export async function loadComments(
  input: unknown,
): Promise<CommentsPayload | null> {
  const parsed = targetSchema.safeParse(input);

  if (!parsed.success) {
    return null;
  }

  try {
    const viewer = await getViewer();
    const { comments, count } = await listPublicComments(
      parsed.data.kind,
      parsed.data.targetId,
      viewer?.id ?? null,
    );

    return { comments, count, viewer };
  } catch (error) {
    console.error("Loading comments failed", error);
    return null;
  }
}

export async function createComment(input: unknown): Promise<ActionResult> {
  const commenter = await getCommenter();

  if ("message" in commenter) {
    return fail(commenter.message);
  }

  const parsed = createSchema.safeParse(input);

  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  const { kind, targetId, parentId, body } = parsed.data;

  try {
    if (!(await isTargetLive(kind, targetId))) {
      return fail("Comments are closed here.");
    }

    // Replies only go one level deep, and only to visible comments on the same post
    if (parentId) {
      const parent = await getReplyTarget(parentId);
      const sameTarget = parent?.[targetColumn(kind)] === targetId;

      if (!parent || !sameTarget || parent.parent_id || parent.is_hidden) {
        return fail("That comment isn't available to reply to.");
      }
    }

    const recent = await countRecentComments(
      commenter.viewer.id,
      RATE_LIMIT_SECONDS,
    );

    if (recent >= RATE_LIMIT_COUNT) {
      return fail(
        "You're commenting very fast. Take a breath and try again in a minute.",
      );
    }

    await insertComment({
      kind,
      targetId,
      parentId,
      userId: commenter.viewer.id,
      body,
    });
  } catch (error) {
    console.error("Posting comment failed", error);
    return fail(GENERIC_ERROR);
  }

  return { ok: true };
}

export async function updateComment(input: unknown): Promise<ActionResult> {
  const commenter = await getCommenter();

  if ("message" in commenter) {
    return fail(commenter.message);
  }

  const parsed = updateSchema.safeParse(input);

  if (!parsed.success) {
    return fail(firstIssue(parsed.error));
  }

  try {
    const own = await getOwnComment(parsed.data.id, commenter.viewer.id);

    if (!own) {
      return fail("You can only edit your own comments.");
    }

    await updateCommentBody(own.id, parsed.data.body);
  } catch (error) {
    console.error("Editing comment failed", error);
    return fail(GENERIC_ERROR);
  }

  return { ok: true };
}

/* Blocked readers can still delete their own comments */
export async function deleteOwnComment(input: unknown): Promise<ActionResult> {
  const viewer = await getViewer();

  if (!viewer) {
    return fail("Sign in to manage your comments.");
  }

  const parsed = deleteSchema.safeParse(input);

  if (!parsed.success) {
    return fail(GENERIC_ERROR);
  }

  try {
    const own = await getOwnComment(parsed.data.id, viewer.id);

    if (!own) {
      return fail("You can only delete your own comments.");
    }

    await removeOwnComment(own.id, own.reply_count > 0);
  } catch (error) {
    console.error("Deleting comment failed", error);
    return fail(GENERIC_ERROR);
  }

  return { ok: true };
}
