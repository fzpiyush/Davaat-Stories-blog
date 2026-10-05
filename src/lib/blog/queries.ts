import "server-only";

import type { Knex } from "knex";
import { cache } from "react";

import type { Blog, BlogSummary } from "@/lib/blog/types";
import { formatReadTime } from "@/lib/content/text";
import { db } from "@/lib/db/knex";
import type { BlogSection } from "@/lib/db/types";

export const BLOGS_PER_PAGE = 12;

const RECOMMENDED_LIMIT = 3;
const FALLBACK_AUTHOR = "The author";
const FALLBACK_CATEGORY = "Uncategorized";

type SummaryRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: Date;
  read_time_minutes: number;
  category_name: string | null;
  image_url: string;
  author_name: string | null;
  tags: string[] | null;
};

type DetailRow = SummaryRow & {
  content: BlogSection[];
  author_bio: string | null;
  author_avatar_url: string | null;
};

const TAGS_SQL = `coalesce((
  select array_agg(t.name order by lower(t.name))
  from blog_tags bt
  join tags t on t.id = bt.tag_id
  where bt.blog_id = b.id
), '{}') as tags`;

const NEWEST_FIRST = [
  { column: "b.published_at", order: "desc" },
  { column: "b.id", order: "desc" },
] as const;

/* Drafts and future posts never leave this file */
function whereLive(builder: Knex.QueryBuilder): void {
  builder
    .whereNot("b.status", "draft")
    .where("b.published_at", "<=", db.fn.now());
}

/* Publishing requires a cover, so every live blog has one */
function liveBlogs(): Knex.QueryBuilder {
  return db("blogs as b")
    .join("media as m", "m.id", "b.cover_media_id")
    .leftJoin("categories as c", "c.id", "b.category_id")
    .leftJoin("authors as a", "a.id", "b.author_id")
    .modify(whereLive);
}

function selectSummary(builder: Knex.QueryBuilder): Knex.QueryBuilder {
  return builder.select(
    "b.id",
    "b.slug",
    "b.title",
    "b.excerpt",
    "b.published_at",
    "b.read_time_minutes",
    "c.name as category_name",
    "m.url as image_url",
    "a.name as author_name",
    db.raw(TAGS_SQL),
  );
}

function toSummary(row: SummaryRow): BlogSummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category_name ?? FALLBACK_CATEGORY,
    tags: row.tags ?? [],
    image: row.image_url,
    publishedAt: row.published_at.toISOString(),
    readTime: formatReadTime(row.read_time_minutes),
    author: row.author_name ?? FALLBACK_AUTHOR,
  };
}

/* The featured blog, or the newest one when nothing is featured */
export const getFeaturedBlog = cache(
  async (): Promise<BlogSummary | undefined> => {
    const featured: SummaryRow | undefined = await selectSummary(liveBlogs())
      .where("b.is_featured", true)
      .first();

    const row: SummaryRow | undefined =
      featured ??
      (await selectSummary(liveBlogs())
        .orderBy([...NEWEST_FIRST])
        .first());

    return row ? toSummary(row) : undefined;
  },
);

export async function getLatestBlogs(
  limit = 3,
  excludeSlug?: string,
): Promise<BlogSummary[]> {
  const rows: SummaryRow[] = await selectSummary(liveBlogs())
    .modify((builder) => {
      if (excludeSlug) {
        builder.whereNot("b.slug", excludeSlug);
      }
    })
    .orderBy([...NEWEST_FIRST])
    .limit(limit);

  return rows.map(toSummary);
}

export async function getBlogsPage(
  page: number,
): Promise<{ items: BlogSummary[]; total: number }> {
  const [countRow, rows] = await Promise.all([
    liveBlogs().count({ count: "*" }).first(),
    selectSummary(liveBlogs())
      .orderBy([...NEWEST_FIRST])
      .limit(BLOGS_PER_PAGE)
      .offset((page - 1) * BLOGS_PER_PAGE),
  ]);

  return {
    items: (rows as SummaryRow[]).map(toSummary),
    total: Number(countRow?.count ?? 0),
  };
}

/* Cached per request, so the page and its metadata share one query */
export const getBlogBySlug = cache(
  async (slug: string): Promise<Blog | undefined> => {
    const row: DetailRow | undefined = await selectSummary(liveBlogs())
      .leftJoin("media as am", "am.id", "a.avatar_media_id")
      .select("b.content", "a.bio as author_bio", "am.url as author_avatar_url")
      .where("b.slug", slug)
      .first();

    if (!row) {
      return undefined;
    }

    return {
      ...toSummary(row),
      content: row.content,
      authorBio: row.author_bio ?? "",
      authorAvatarUrl: row.author_avatar_url,
    };
  },
);

/* Previous is the next older post, next is the next newer one */
export async function getAdjacentBlogs(
  blog: BlogSummary,
): Promise<{ previousBlog?: BlogSummary; nextBlog?: BlogSummary }> {
  const position = [blog.publishedAt, blog.id];

  const [previous, next]: (SummaryRow | undefined)[] = await Promise.all([
    selectSummary(liveBlogs())
      .whereRaw("(b.published_at, b.id) < (?::timestamptz, ?::uuid)", position)
      .orderBy([...NEWEST_FIRST])
      .first(),
    selectSummary(liveBlogs())
      .whereRaw("(b.published_at, b.id) > (?::timestamptz, ?::uuid)", position)
      .orderBy([
        { column: "b.published_at", order: "asc" },
        { column: "b.id", order: "asc" },
      ])
      .first(),
  ]);

  return {
    previousBlog: previous ? toSummary(previous) : undefined,
    nextBlog: next ? toSummary(next) : undefined,
  };
}

/*
 * Your hand picked posts come first. Any empty spots get filled
 * by posts sharing the category (worth 2) and tags (worth 1 each),
 * with newer posts winning ties.
 */
export async function getRecommendedBlogs(
  blogId: string,
  limit = RECOMMENDED_LIMIT,
): Promise<BlogSummary[]> {
  const picks: SummaryRow[] = await selectSummary(liveBlogs())
    .join("blog_recommendations as r", "r.recommended_blog_id", "b.id")
    .where("r.blog_id", blogId)
    .orderBy("r.position", "asc")
    .limit(limit);

  if (picks.length >= limit) {
    return picks.map(toSummary);
  }

  const fillers: SummaryRow[] = await selectSummary(liveBlogs())
    .select(
      db.raw(
        `(
          case when b.category_id = (select category_id from blogs where id = ?) then 2 else 0 end
          + (
            select count(*) from blog_tags bt
            where bt.blog_id = b.id
              and bt.tag_id in (select tag_id from blog_tags where blog_id = ?)
          )
        )::int as score`,
        [blogId, blogId],
      ),
    )
    .whereNotIn("b.id", [blogId, ...picks.map((pick) => pick.id)])
    .orderBy([{ column: "score", order: "desc" }, ...NEWEST_FIRST])
    .limit(limit - picks.length);

  return [...picks, ...fillers].map(toSummary);
}
