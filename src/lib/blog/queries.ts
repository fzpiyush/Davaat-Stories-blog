import "server-only";

import type { Knex } from "knex";
import { cache } from "react";

import type { Blog, BlogSummary } from "@/lib/blog/types";
import type { FilterOption } from "@/lib/content/filters";
import { formatReadTime } from "@/lib/content/text";
import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
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
  view_count: number;
};

type DetailRow = SummaryRow & {
  content: BlogSection[];
  author_bio: string | null;
  author_avatar_url: string | null;
};

export type BlogListFilters = {
  query: string;
  category: string;
  tag: string;
};

export type BlogListParams = BlogListFilters & {
  page: number;
};

const TAGS_SQL = `coalesce((
  select array_agg(t.name order by lower(t.name))
  from blog_tags bt
  join tags t on t.id = bt.tag_id
  where bt.blog_id = b.id
), '{}') as tags`;

const VIEWS_SQL =
  "(select count(*) from page_views pv where pv.blog_id = b.id)::int as view_count";

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

/* Search looks at the title, excerpt and tags. Category and tag match exactly */
function applyFilters(
  builder: Knex.QueryBuilder,
  filters: BlogListFilters,
): void {
  const { query, category, tag } = filters;

  if (query) {
    const pattern = `%${escapeLike(query)}%`;

    builder.where((search) => {
      search
        .whereILike("b.title", pattern)
        .orWhereILike("b.excerpt", pattern)
        .orWhereIn(
          "b.id",
          db("blog_tags as bt")
            .join("tags as t", "t.id", "bt.tag_id")
            .whereILike("t.name", pattern)
            .select("bt.blog_id"),
        );
    });
  }

  if (category) {
    builder.where("c.slug", category);
  }

  if (tag) {
    builder.whereIn(
      "b.id",
      db("blog_tags as bt")
        .join("tags as t", "t.id", "bt.tag_id")
        .where("t.slug", tag)
        .select("bt.blog_id"),
    );
  }
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
    db.raw(VIEWS_SQL),
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
    viewCount: row.view_count,
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

export async function getBlogsPage({
  page,
  ...filters
}: BlogListParams): Promise<{ items: BlogSummary[]; total: number }> {
  const [countRow, rows] = await Promise.all([
    liveBlogs().modify(applyFilters, filters).count({ count: "*" }).first(),
    selectSummary(liveBlogs())
      .modify(applyFilters, filters)
      .orderBy([...NEWEST_FIRST])
      .limit(BLOGS_PER_PAGE)
      .offset((page - 1) * BLOGS_PER_PAGE),
  ]);

  return {
    items: (rows as SummaryRow[]).map(toSummary),
    total: Number(countRow?.count ?? 0),
  };
}

/* Only categories and tags that have at least one live blog */
export async function getBlogFilterOptions(): Promise<{
  categories: FilterOption[];
  tags: FilterOption[];
}> {
  const [categories, tags]: FilterOption[][] = await Promise.all([
    db("categories as c")
      .whereExists(
        db("blogs as b")
          .select(db.raw("1"))
          .whereRaw("b.category_id = c.id")
          .modify(whereLive),
      )
      .select("c.slug as slug", "c.name as name")
      .orderByRaw("lower(c.name) asc"),
    db("tags as t")
      .whereExists(
        db("blog_tags as bt")
          .select(db.raw("1"))
          .join("blogs as b", "b.id", "bt.blog_id")
          .whereRaw("bt.tag_id = t.id")
          .modify(whereLive),
      )
      .select("t.slug as slug", "t.name as name")
      .orderByRaw("lower(t.name) asc"),
  ]);

  return { categories, tags };
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
