import "server-only";

import type { Knex } from "knex";

import type { StatusFilter } from "@/lib/content/status";
import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
import { ensureTagIds } from "@/lib/db/tagLinks";
import type { BlogRow, BlogSection, ContentStatus } from "@/lib/db/types";

export const BLOG_PAGE_SIZE = 20;

export class BlogNotFoundError extends Error {}

export type AdminBlogListItem = {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  published_at: Date | null;
  updated_at: Date;
  is_featured: boolean;
  read_time_minutes: number;
  category_name: string | null;
  cover_url: string | null;
  view_count: number;
  like_count: number;
  comment_count: number;
};

export type StatusCounts = Record<StatusFilter, number>;

export type BlogEditorRecord = {
  blog: BlogRow;
  cover: { id: string; url: string; alt_text: string } | null;
  tagNames: string[];
  recommendationIds: string[];
};

export type BlogOptionRow = {
  id: string;
  title: string;
  status: ContentStatus;
  published_at: Date | null;
};

export type BlogSaveInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: BlogSection[];
  coverMediaId: string | null;
  categoryId: string | null;
  authorId: string | null;
  status: ContentStatus;
  publishedAt: Date | null;
  isFeatured: boolean;
  readTimeMinutes: number;
  tagNames: string[];
  recommendationIds: string[];
};

function applyStatusFilter(
  builder: Knex.QueryBuilder,
  filter: StatusFilter,
): void {
  if (filter === "draft") {
    builder.where("b.status", "draft");
    return;
  }

  if (filter === "published") {
    builder
      .whereNot("b.status", "draft")
      .where("b.published_at", "<=", db.fn.now());
    return;
  }

  if (filter === "scheduled") {
    builder
      .whereNot("b.status", "draft")
      .where("b.published_at", ">", db.fn.now());
  }
}

export async function listAdminBlogs({
  filter,
  query,
  page,
}: {
  filter: StatusFilter;
  query: string;
  page: number;
}): Promise<{ items: AdminBlogListItem[]; total: number }> {
  const filtered = db("blogs as b")
    .modify(applyStatusFilter, filter)
    .modify((builder) => {
      if (query) {
        builder.whereILike("b.title", `%${escapeLike(query)}%`);
      }
    });

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .leftJoin("categories as c", "c.id", "b.category_id")
      .leftJoin("media as m", "m.id", "b.cover_media_id")
      .select(
        "b.id",
        "b.slug",
        "b.title",
        "b.status",
        "b.published_at",
        "b.updated_at",
        "b.is_featured",
        "b.read_time_minutes",
        "c.name as category_name",
        "m.url as cover_url",
        db.raw(
          "(select count(*) from page_views pv where pv.blog_id = b.id)::int as view_count",
        ),
        db.raw(
          "(select count(*) from likes l where l.blog_id = b.id)::int as like_count",
        ),
        db.raw(
          "(select count(*) from comments cm where cm.blog_id = b.id and not cm.is_hidden)::int as comment_count",
        ),
      )
      .orderBy("b.updated_at", "desc")
      .limit(BLOG_PAGE_SIZE)
      .offset((page - 1) * BLOG_PAGE_SIZE),
  ]);

  return {
    items: items as AdminBlogListItem[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getBlogStatusCounts(): Promise<StatusCounts> {
  const row = await db("blogs").first(
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

export async function getBlogForEditor(
  id: string,
): Promise<BlogEditorRecord | undefined> {
  const blog = await db<BlogRow>("blogs").where({ id }).first();

  if (!blog) {
    return undefined;
  }

  const [cover, tagNames, recommendationIds] = await Promise.all([
    blog.cover_media_id
      ? db("media")
          .select("id", "url", "alt_text")
          .where({ id: blog.cover_media_id })
          .first()
      : null,
    db("blog_tags as bt")
      .join("tags as t", "t.id", "bt.tag_id")
      .where("bt.blog_id", id)
      .orderByRaw("lower(t.name) asc")
      .pluck("t.name"),
    db("blog_recommendations")
      .where({ blog_id: id })
      .orderBy("position", "asc")
      .pluck("recommended_blog_id"),
  ]);

  return { blog, cover: cover ?? null, tagNames, recommendationIds };
}

export async function listBlogOptions(
  excludeId?: string,
): Promise<BlogOptionRow[]> {
  return db("blogs")
    .select("id", "title", "status", "published_at")
    .modify((builder) => {
      if (excludeId) {
        builder.whereNot({ id: excludeId });
      }
    })
    .orderByRaw("lower(title) asc");
}

export async function saveBlogRecord(
  input: BlogSaveInput,
  id: string | null,
  userId: string,
): Promise<string> {
  return db.transaction(async (trx) => {
    // Only one featured blog, so the old one steps down first
    if (input.isFeatured) {
      await trx("blogs")
        .where({ is_featured: true })
        .modify((builder) => {
          if (id) {
            builder.whereNot({ id });
          }
        })
        .update({ is_featured: false });
    }

    const row = {
      slug: input.slug,
      title: input.title,
      excerpt: input.excerpt,
      content: JSON.stringify(input.content),
      cover_media_id: input.coverMediaId,
      category_id: input.categoryId,
      status: input.status,
      published_at: input.publishedAt,
      is_featured: input.isFeatured,
      read_time_minutes: input.readTimeMinutes,
      updated_at: new Date(),
    };

    let blogId: string;

    if (id) {
      const updated = await trx("blogs").where({ id }).update(row);

      if (updated === 0) {
        throw new BlogNotFoundError();
      }

      blogId = id;
    } else {
      const [created]: { id: string }[] = await trx("blogs")
        .insert({ ...row, author_id: input.authorId, created_by: userId })
        .returning("id");

      blogId = created.id;
    }

    const tagIds = await ensureTagIds(trx, input.tagNames);

    await trx("blog_tags").where({ blog_id: blogId }).delete();

    if (tagIds.length > 0) {
      await trx("blog_tags").insert(
        tagIds.map((tagId) => ({ blog_id: blogId, tag_id: tagId })),
      );
    }

    await trx("blog_recommendations").where({ blog_id: blogId }).delete();

    if (input.recommendationIds.length > 0) {
      await trx("blog_recommendations").insert(
        input.recommendationIds.map((recommendedId, position) => ({
          blog_id: blogId,
          recommended_blog_id: recommendedId,
          position,
        })),
      );
    }

    return blogId;
  });
}

export async function deleteBlogRecord(id: string): Promise<void> {
  await db("blogs").where({ id }).delete();
}
