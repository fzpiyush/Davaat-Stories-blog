import "server-only";

import type { Knex } from "knex";

import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
import type { UserRole } from "@/lib/db/types";

export const COMMENT_PAGE_SIZE = 25;
export const COMMENT_FILTERS = ["all", "visible", "hidden"] as const;
export type CommentFilter = (typeof COMMENT_FILTERS)[number];

export type AdminCommentItem = {
  id: string;
  body: string;
  is_hidden: boolean;
  parent_id: string | null;
  created_at: Date;
  edited_at: Date | null;
  user_id: string;
  user_name: string | null;
  user_email: string;
  user_avatar_url: string | null;
  user_role: UserRole;
  user_is_blocked: boolean;
  blog_title: string | null;
  blog_slug: string | null;
  story_title: string | null;
  story_slug: string | null;
  reply_count: number;
};

function applyFilter(builder: Knex.QueryBuilder, filter: CommentFilter): void {
  if (filter === "visible") {
    builder.where("cm.is_hidden", false);
  }

  if (filter === "hidden") {
    builder.where("cm.is_hidden", true);
  }
}

function applySearch(builder: Knex.QueryBuilder, query: string): void {
  if (!query) {
    return;
  }

  const pattern = `%${escapeLike(query)}%`;

  builder.where((inner) => {
    inner
      .whereILike("cm.body", pattern)
      .orWhereILike("u.name", pattern)
      .orWhereILike("u.email", pattern);
  });
}

export async function listAdminComments({
  filter,
  query,
  page,
}: {
  filter: CommentFilter;
  query: string;
  page: number;
}): Promise<{ items: AdminCommentItem[]; total: number }> {
  const filtered = db("comments as cm")
    .join("users as u", "u.id", "cm.user_id")
    .modify(applyFilter, filter)
    .modify(applySearch, query);

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .leftJoin("blogs as b", "b.id", "cm.blog_id")
      .leftJoin("stories as s", "s.id", "cm.story_id")
      .select(
        "cm.id",
        "cm.body",
        "cm.is_hidden",
        "cm.parent_id",
        "cm.created_at",
        "cm.edited_at",
        "u.id as user_id",
        "u.name as user_name",
        "u.email as user_email",
        "u.avatar_url as user_avatar_url",
        "u.role as user_role",
        "u.is_blocked as user_is_blocked",
        "b.title as blog_title",
        "b.slug as blog_slug",
        "s.title as story_title",
        "s.slug as story_slug",
        db.raw(
          "(select count(*) from comments r where r.parent_id = cm.id)::int as reply_count",
        ),
      )
      .orderBy("cm.created_at", "desc")
      .limit(COMMENT_PAGE_SIZE)
      .offset((page - 1) * COMMENT_PAGE_SIZE),
  ]);

  return {
    items: items as AdminCommentItem[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getCommentCounts(): Promise<
  Record<CommentFilter, number>
> {
  const row = await db("comments").first(
    db.raw("count(*)::int as total"),
    db.raw("(count(*) filter (where not is_hidden))::int as visible"),
    db.raw("(count(*) filter (where is_hidden))::int as hidden"),
  );

  return {
    all: row?.total ?? 0,
    visible: row?.visible ?? 0,
    hidden: row?.hidden ?? 0,
  };
}

export async function setCommentHidden(
  id: string,
  hidden: boolean,
): Promise<void> {
  await db("comments")
    .where({ id })
    .update({ is_hidden: hidden, updated_at: new Date() });
}

/* Replies go with it, the database removes them automatically */
export async function deleteComment(id: string): Promise<void> {
  await db("comments").where({ id }).delete();
}
