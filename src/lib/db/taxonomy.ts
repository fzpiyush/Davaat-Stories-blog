import "server-only";

import type { Knex } from "knex";

import type { TaxonomyKind } from "@/lib/admin/taxonomy/config";
import { db } from "@/lib/db/knex";

export type Term = {
  id: string;
  name: string;
  slug: string;
  description: string;
  blog_count: number;
  story_count: number;
  updated_at: Date;
};

export type TermInput = {
  name: string;
  slug: string;
  description: string;
};

const USAGE_SQL: Record<TaxonomyKind, { blogs: string; stories: string }> = {
  categories: {
    blogs:
      "(select count(*) from blogs b where b.category_id = t.id)::int as blog_count",
    stories:
      "(select count(*) from stories s where s.category_id = t.id)::int as story_count",
  },
  tags: {
    blogs:
      "(select count(*) from blog_tags bt where bt.tag_id = t.id)::int as blog_count",
    stories:
      "(select count(*) from story_tags st where st.tag_id = t.id)::int as story_count",
  },
};

function selectTerms(kind: TaxonomyKind): Knex.QueryBuilder {
  return db(`${kind} as t`).select(
    "t.id",
    "t.name",
    "t.slug",
    kind === "categories" ? "t.description" : db.raw("'' as description"),
    "t.updated_at",
    db.raw(USAGE_SQL[kind].blogs),
    db.raw(USAGE_SQL[kind].stories),
  );
}

// Tags have no description column
function toRow(kind: TaxonomyKind, input: TermInput) {
  return kind === "categories" ? input : { name: input.name, slug: input.slug };
}

export async function listTerms(kind: TaxonomyKind): Promise<Term[]> {
  return selectTerms(kind).orderByRaw("lower(t.name) asc");
}

export async function getTerm(
  kind: TaxonomyKind,
  id: string,
): Promise<Term | undefined> {
  return selectTerms(kind).where("t.id", id).first();
}

export async function createTerm(
  kind: TaxonomyKind,
  input: TermInput,
): Promise<void> {
  await db(kind).insert(toRow(kind, input));
}

export async function updateTerm(
  kind: TaxonomyKind,
  id: string,
  input: TermInput,
): Promise<void> {
  await db(kind)
    .where({ id })
    .update({ ...toRow(kind, input), updated_at: new Date() });
}

export async function deleteTerm(
  kind: TaxonomyKind,
  id: string,
): Promise<void> {
  await db(kind).where({ id }).delete();
}
