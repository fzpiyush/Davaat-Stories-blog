import "server-only";

import type { Knex } from "knex";

import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";

export const READER_PAGE_SIZE = 25;
export const READER_FILTERS = ["all", "active", "blocked"] as const;
export type ReaderFilter = (typeof READER_FILTERS)[number];

export type ReaderItem = {
  id: string;
  name: string | null;
  email: string;
  avatar_url: string | null;
  is_blocked: boolean;
  blocked_at: Date | null;
  created_at: Date;
  last_login_at: Date | null;
  comment_count: number;
  hidden_count: number;
};

function applyFilter(builder: Knex.QueryBuilder, filter: ReaderFilter): void {
  if (filter === "active") {
    builder.where("u.is_blocked", false);
  }

  if (filter === "blocked") {
    builder.where("u.is_blocked", true);
  }
}

function applySearch(builder: Knex.QueryBuilder, query: string): void {
  if (!query) {
    return;
  }

  const pattern = `%${escapeLike(query)}%`;

  builder.where((inner) => {
    inner.whereILike("u.name", pattern).orWhereILike("u.email", pattern);
  });
}

export async function listReaders({
  filter,
  query,
  page,
}: {
  filter: ReaderFilter;
  query: string;
  page: number;
}): Promise<{ items: ReaderItem[]; total: number }> {
  const filtered = db("users as u")
    .where("u.role", "reader")
    .modify(applyFilter, filter)
    .modify(applySearch, query);

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .select(
        "u.id",
        "u.name",
        "u.email",
        "u.avatar_url",
        "u.is_blocked",
        "u.blocked_at",
        "u.created_at",
        "u.last_login_at",
        db.raw("(select count(*) from comments c where c.user_id = u.id)::int as comment_count"),
        db.raw(
          "(select count(*) from comments c where c.user_id = u.id and c.is_hidden)::int as hidden_count",
        ),
      )
      .orderBy("u.created_at", "desc")
      .limit(READER_PAGE_SIZE)
      .offset((page - 1) * READER_PAGE_SIZE),
  ]);

  return {
    items: items as ReaderItem[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getReaderCounts(): Promise<Record<ReaderFilter, number>> {
  const row = await db("users")
    .where({ role: "reader" })
    .first(
      db.raw("count(*)::int as total"),
      db.raw("(count(*) filter (where not is_blocked))::int as active"),
      db.raw("(count(*) filter (where is_blocked))::int as blocked"),
    );

  return {
    all: row?.total ?? 0,
    active: row?.active ?? 0,
    blocked: row?.blocked ?? 0,
  };
}

/* Only readers can be blocked, never an admin */
export async function setReaderBlocked(id: string, blocked: boolean): Promise<void> {
  const now = new Date();

  await db("users")
    .where({ id, role: "reader" })
    .update({
      is_blocked: blocked,
      blocked_at: blocked ? now : null,
      updated_at: now,
    });
}