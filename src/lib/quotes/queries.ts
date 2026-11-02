import "server-only";

import type { Knex } from "knex";
import { cache } from "react";

import { db } from "@/lib/db/knex";
import type { QuoteLang } from "@/lib/db/types";
import type { PublicQuote } from "@/lib/quotes/types";

export const QUOTES_PER_PAGE = 24;

type QuoteSelectRow = {
  id: string;
  text: string;
  lang: QuoteLang;
  translation: string;
  author: string;
};

const COLUMNS = ["q.id", "q.text", "q.lang", "q.translation", "q.author"];

const NEWEST_FIRST = [
  { column: "q.published_at", order: "desc" },
  { column: "q.id", order: "desc" },
] as const;

/* Drafts and future quotes never leave this file */
function whereLive(builder: Knex.QueryBuilder): void {
  builder
    .whereNot("q.status", "draft")
    .where("q.published_at", "<=", db.fn.now());
}

function liveQuotes(lang: QuoteLang | ""): Knex.QueryBuilder {
  return db("quotes as q")
    .modify(whereLive)
    .modify((builder) => {
      if (lang) {
        builder.where("q.lang", lang);
      }
    });
}

function toPublicQuote(row: QuoteSelectRow): PublicQuote {
  return {
    id: row.id,
    text: row.text,
    lang: row.lang,
    translation: row.translation || null,
    author: row.author || null,
  };
}

/* The featured quote, only when it matches the chosen language */
export const getFeaturedQuote = cache(
  async (lang: QuoteLang | ""): Promise<PublicQuote | undefined> => {
    const row: QuoteSelectRow | undefined = await liveQuotes(lang)
      .where("q.is_featured", true)
      .select(COLUMNS)
      .first();

    return row ? toPublicQuote(row) : undefined;
  },
);

/* Every live quote except the featured one, which shows on its own */
export async function getQuotesPage({
  page,
  lang,
}: {
  page: number;
  lang: QuoteLang | "";
}): Promise<{ items: PublicQuote[]; total: number }> {
  const listed = () => liveQuotes(lang).where("q.is_featured", false);

  const [countRow, rows] = await Promise.all([
    listed().count({ count: "*" }).first(),
    listed()
      .select(COLUMNS)
      .orderBy([...NEWEST_FIRST])
      .limit(QUOTES_PER_PAGE)
      .offset((page - 1) * QUOTES_PER_PAGE),
  ]);

  return {
    items: (rows as QuoteSelectRow[]).map(toPublicQuote),
    total: Number(countRow?.count ?? 0),
  };
}
