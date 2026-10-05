import "server-only";

import { db } from "@/lib/db/knex";
import type { EngagementKind, LikeState } from "@/lib/engagement/types";

const LIVE = "status <> 'draft' and published_at <= now()";

const TABLE: Record<EngagementKind, "blogs" | "stories"> = {
  blog: "blogs",
  story: "stories",
};

const COLUMN: Record<EngagementKind, "blog_id" | "story_id"> = {
  blog: "blog_id",
  story: "story_id",
};

export function targetColumn(kind: EngagementKind): "blog_id" | "story_id" {
  return COLUMN[kind];
}

export async function isTargetLive(
  kind: EngagementKind,
  id: string,
): Promise<boolean> {
  const row = await db(TABLE[kind]).where({ id }).whereRaw(LIVE).first("id");
  return Boolean(row);
}

/* A chapter only counts when both it and its story are live */
export async function getLiveChapterStoryId(
  chapterId: string,
): Promise<string | null> {
  const row: { story_id: string } | undefined = await db("chapters as ch")
    .join("stories as s", "s.id", "ch.story_id")
    .where("ch.id", chapterId)
    .whereNot("ch.status", "draft")
    .where("ch.published_at", "<=", db.fn.now())
    .whereNot("s.status", "draft")
    .where("s.published_at", "<=", db.fn.now())
    .first("s.id as story_id");

  return row?.story_id ?? null;
}

// The daily unique rules from Part 1 quietly skip repeat views
export async function recordBlogView(
  blogId: string,
  visitorHash: string,
): Promise<void> {
  await db.raw(
    "insert into page_views (blog_id, visitor_hash) values (?, ?) on conflict do nothing",
    [blogId, visitorHash],
  );
}

export async function recordChapterView(
  storyId: string,
  chapterId: string,
  visitorHash: string,
): Promise<void> {
  await db.raw(
    "insert into page_views (story_id, chapter_id, visitor_hash) values (?, ?, ?) on conflict do nothing",
    [storyId, chapterId, visitorHash],
  );
}

export async function getLikeState(
  kind: EngagementKind,
  id: string,
  visitorHash: string | null,
): Promise<LikeState> {
  const row = await db("likes")
    .where({ [COLUMN[kind]]: id })
    .first(
      db.raw("count(*)::int as count"),
      visitorHash
        ? db.raw("coalesce(bool_or(visitor_hash = ?), false) as liked", [
            visitorHash,
          ])
        : db.raw("false as liked"),
    );

  return { count: row?.count ?? 0, liked: Boolean(row?.liked) };
}

export async function toggleLikeRecord(
  kind: EngagementKind,
  id: string,
  visitorHash: string,
): Promise<void> {
  const column = COLUMN[kind];
  const removed = await db("likes")
    .where({ [column]: id, visitor_hash: visitorHash })
    .delete();

  if (removed === 0) {
    await db.raw(
      `insert into likes (${column}, visitor_hash) values (?, ?) on conflict do nothing`,
      [id, visitorHash],
    );
  }
}
