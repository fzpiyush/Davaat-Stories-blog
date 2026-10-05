import "server-only";

import { targetColumn } from "@/lib/db/engagement";
import { db } from "@/lib/db/knex";
import type { UserRole } from "@/lib/db/types";
import type { EngagementKind, PublicComment } from "@/lib/engagement/types";

const MAX_COMMENTS = 500;

type CommentRecord = {
  id: string;
  parent_id: string | null;
  body: string;
  is_hidden: boolean;
  created_at: Date;
  edited_at: Date | null;
  user_id: string;
  user_name: string | null;
  user_avatar_url: string | null;
  user_role: UserRole;
};

export type ReplyTarget = {
  id: string;
  parent_id: string | null;
  blog_id: string | null;
  story_id: string | null;
  is_hidden: boolean;
};

function toPublic(row: CommentRecord, viewerId: string | null): PublicComment {
  return {
    id: row.id,
    parentId: row.parent_id,
    body: row.is_hidden ? "" : row.body,
    createdAt: row.created_at.toISOString(),
    editedAt: row.edited_at?.toISOString() ?? null,
    isRemoved: row.is_hidden,
    isMine: !row.is_hidden && row.user_id === viewerId,
    author: row.is_hidden
      ? null
      : {
          name: row.user_name ?? "Reader",
          avatarUrl: row.user_avatar_url,
          isAuthor: row.user_role === "admin",
        },
    replies: [],
  };
}

/*
 * Top level comments come newest first, replies oldest first.
 * A hidden comment stays as a removed placeholder only when it
 * still has visible replies, so those replies keep their context.
 */
export async function listPublicComments(
  kind: EngagementKind,
  targetId: string,
  viewerId: string | null,
): Promise<{ comments: PublicComment[]; count: number }> {
  const rows: CommentRecord[] = await db("comments as c")
    .join("users as u", "u.id", "c.user_id")
    .where(`c.${targetColumn(kind)}`, targetId)
    .select(
      "c.id",
      "c.parent_id",
      "c.body",
      "c.is_hidden",
      "c.created_at",
      "c.edited_at",
      "c.user_id",
      "u.name as user_name",
      "u.avatar_url as user_avatar_url",
      "u.role as user_role",
    )
    .orderBy("c.created_at", "asc")
    .limit(MAX_COMMENTS);

  const repliesByParent = new Map<string, PublicComment[]>();

  for (const row of rows) {
    if (row.parent_id && !row.is_hidden) {
      const list = repliesByParent.get(row.parent_id) ?? [];
      list.push(toPublic(row, viewerId));
      repliesByParent.set(row.parent_id, list);
    }
  }

  const comments = rows
    .filter((row) => !row.parent_id)
    .flatMap((row) => {
      const replies = repliesByParent.get(row.id) ?? [];

      if (row.is_hidden && replies.length === 0) {
        return [];
      }

      return [{ ...toPublic(row, viewerId), replies }];
    })
    .reverse();

  return {
    comments,
    count: rows.filter((row) => !row.is_hidden).length,
  };
}

export async function getReplyTarget(
  id: string,
): Promise<ReplyTarget | undefined> {
  return db("comments")
    .select("id", "parent_id", "blog_id", "story_id", "is_hidden")
    .where({ id })
    .first();
}

export async function countRecentComments(
  userId: string,
  seconds: number,
): Promise<number> {
  const row = await db("comments")
    .where({ user_id: userId })
    .whereRaw("created_at > now() - make_interval(secs => ?)", [seconds])
    .first(db.raw("count(*)::int as count"));

  return row?.count ?? 0;
}

export async function insertComment(input: {
  kind: EngagementKind;
  targetId: string;
  parentId: string | null;
  userId: string;
  body: string;
}): Promise<void> {
  await db("comments").insert({
    [targetColumn(input.kind)]: input.targetId,
    parent_id: input.parentId,
    user_id: input.userId,
    body: input.body,
  });
}

export async function getOwnComment(
  id: string,
  userId: string,
): Promise<{ id: string; reply_count: number } | undefined> {
  return db("comments as c")
    .where({ "c.id": id, "c.user_id": userId, "c.is_hidden": false })
    .first(
      "c.id",
      db.raw(
        "(select count(*) from comments r where r.parent_id = c.id and not r.is_hidden)::int as reply_count",
      ),
    );
}

export async function updateCommentBody(
  id: string,
  body: string,
): Promise<void> {
  const now = new Date();
  await db("comments")
    .where({ id })
    .update({ body, edited_at: now, updated_at: now });
}

/* With replies it becomes a removed placeholder, without replies it's deleted */
export async function removeOwnComment(
  id: string,
  hasReplies: boolean,
): Promise<void> {
  if (hasReplies) {
    await db("comments")
      .where({ id })
      .update({ is_hidden: true, updated_at: new Date() });
    return;
  }

  await db("comments").where({ id }).delete();
}
