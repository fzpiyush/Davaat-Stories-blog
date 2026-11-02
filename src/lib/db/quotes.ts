import "server-only";

import type { Knex } from "knex";

import type { StatusFilter } from "@/lib/content/status";
import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
import type { ContentStatus, QuoteLang, QuoteRow } from "@/lib/db/types";

export const QUOTE_PAGE_SIZE = 20;

export class QuoteNotFoundError extends Error {}

export type AdminQuoteListItem = Pick<
  QuoteRow,
  | "id"
  | "text"
  | "lang"
  | "author"
  | "status"
  | "published_at"
  | "updated_at"
  | "is_featured"
>;

export type QuoteStatusCounts = Record<StatusFilter, number>;

export type QuoteSaveInput = {
  text: string;
  lang: QuoteLang;
  translation: string;
  author: string;
  status: ContentStatus;
  publishedAt: Date | null;
  isFeatured: boolean;
};

function applyStatusFilter(
  builder: Knex.QueryBuilder,
  filter: StatusFilter,
): void {
  if (filter === "draft") {
    builder.where("q.status", "draft");
    return;
  }

  if (filter === "published") {
    builder
      .whereNot("q.status", "draft")
      .where("q.published_at", "<=", db.fn.now());
    return;
  }

  if (filter === "scheduled") {
    builder
      .whereNot("q.status", "draft")
      .where("q.published_at", ">", db.fn.now());
  }
}

/* Search looks at the quote, its translation and the author */
function applySearch(builder: Knex.QueryBuilder, query: string): void {
  if (!query) {
    return;
  }

  const pattern = `%${escapeLike(query)}%`;

  builder.where((search) => {
    search
      .whereILike("q.text", pattern)
      .orWhereILike("q.translation", pattern)
      .orWhereILike("q.author", pattern);
  });
}

export async function listAdminQuotes({
  filter,
  query,
  page,
}: {
  filter: StatusFilter;
  query: string;
  page: number;
}): Promise<{ items: AdminQuoteListItem[]; total: number }> {
  const filtered = db("quotes as q")
    .modify(applyStatusFilter, filter)
    .modify(applySearch, query);

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .select(
        "q.id",
        "q.text",
        "q.lang",
        "q.author",
        "q.status",
        "q.published_at",
        "q.updated_at",
        "q.is_featured",
      )
      .orderBy("q.updated_at", "desc")
      .limit(QUOTE_PAGE_SIZE)
      .offset((page - 1) * QUOTE_PAGE_SIZE),
  ]);

  return {
    items: items as AdminQuoteListItem[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getQuoteStatusCounts(): Promise<QuoteStatusCounts> {
  const row = await db("quotes").first(
    db.raw("count(*)::int as total"),
    db.raw("(count(*) filter (where status = 'draft'))::int as draft"),
    db.raw(
      "(count(*) filter (where status <> 'draft' and published_at <= now()))::int as published",
    ),
    db.raw(
      "(count(*) filter (where status <> 'draft' and published_at > now()))::int as scheduled",
    ),
  );

  return {
    all: row?.total ?? 0,
    draft: row?.draft ?? 0,
    published: row?.published ?? 0,
    scheduled: row?.scheduled ?? 0,
  };
}

export async function getQuoteForEditor(
  id: string,
): Promise<QuoteRow | undefined> {
  return db<QuoteRow>("quotes").where({ id }).first();
}

export async function saveQuoteRecord(
  input: QuoteSaveInput,
  id: string | null,
  userId: string,
): Promise<string> {
  return db.transaction(async (trx) => {
    // Only one featured quote, so the old one steps down first
    if (input.isFeatured) {
      await trx("quotes")
        .where({ is_featured: true })
        .modify((builder) => {
          if (id) {
            builder.whereNot({ id });
          }
        })
        .update({ is_featured: false });
    }

    const row = {
      text: input.text,
      lang: input.lang,
      translation: input.translation,
      author: input.author,
      status: input.status,
      published_at: input.publishedAt,
      is_featured: input.isFeatured,
      updated_at: new Date(),
    };

    if (id) {
      const updated = await trx("quotes").where({ id }).update(row);

      if (updated === 0) {
        throw new QuoteNotFoundError();
      }

      return id;
    }

    const [created]: { id: string }[] = await trx("quotes")
      .insert({ ...row, created_by: userId })
      .returning("id");

    return created.id;
  });
}

export async function deleteQuoteRecord(id: string): Promise<void> {
  await db("quotes").where({ id }).delete();
}
