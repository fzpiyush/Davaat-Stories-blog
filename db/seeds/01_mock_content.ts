import type { Knex } from "knex";

import { blogs as mockBlogs } from "./data/mockBlogs";

type MockBlog = (typeof mockBlogs)[number];

const WORDS_PER_MINUTE = 200;
const DEFAULT_BIO =
  "Writing about technology, life, ideas, and the lessons I learn along the way.";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Keeps the same calendar day no matter which timezone runs the seed
function toUtcDay(value: string): Date {
  const local = new Date(value);

  return new Date(
    Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()),
  );
}

function getReadTimeMinutes(blog: MockBlog): number {
  const words = blog.content
    .flatMap((section) => [
      section.heading ?? "",
      ...section.paragraphs,
      section.quote ?? "",
    ])
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function uniqueNames(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

async function getOrCreateAuthorId(
  trx: Knex.Transaction,
  name: string,
): Promise<string> {
  const existing: { id: string } | undefined = await trx("authors")
    .orderBy("created_at", "asc")
    .first("id");

  if (existing) {
    return existing.id;
  }

  const [created]: { id: string }[] = await trx("authors")
    .insert({ name, slug: slugify(name), bio: DEFAULT_BIO })
    .returning("id");

  return created.id;
}

async function upsertNamed(
  trx: Knex.Transaction,
  table: "categories" | "tags",
  names: string[],
): Promise<Map<string, string>> {
  if (names.length === 0) {
    return new Map();
  }

  const rows: { id: string; name: string }[] = await trx(table)
    .insert(names.map((name) => ({ name, slug: slugify(name) })))
    .onConflict("slug")
    .merge(["name"])
    .returning(["id", "name"]);

  return new Map(rows.map((row) => [row.name, row.id]));
}

export async function seed(knex: Knex): Promise<void> {
  const existingBlog = await knex("blogs").first("id");

  if (existingBlog) {
    console.log("Blogs already exist, skipping the mock content seed");
    return;
  }

  await knex.transaction(async (trx) => {
    const authorId = await getOrCreateAuthorId(
      trx,
      mockBlogs[0]?.author ?? "Author",
    );

    const categoryIds = await upsertNamed(
      trx,
      "categories",
      uniqueNames(mockBlogs.map((blog) => blog.category)),
    );

    const tagIds = await upsertNamed(
      trx,
      "tags",
      uniqueNames(mockBlogs.flatMap((blog) => blog.tags)),
    );

    for (const blog of mockBlogs) {
      const publishedAt = toUtcDay(blog.publishedAt);

      const [media]: { id: string }[] = await trx("media")
        .insert({ url: blog.image, alt_text: blog.title })
        .returning("id");

      const [row]: { id: string }[] = await trx("blogs")
        .insert({
          slug: blog.slug,
          title: blog.title,
          excerpt: blog.excerpt,
          // pg turns arrays into Postgres arrays, so jsonb needs a string
          content: JSON.stringify(blog.content),
          cover_media_id: media.id,
          category_id: categoryIds.get(blog.category.trim()) ?? null,
          author_id: authorId,
          status: "published",
          published_at: publishedAt,
          read_time_minutes: getReadTimeMinutes(blog),
          created_at: publishedAt,
          updated_at: publishedAt,
        })
        .returning("id");

      const tagRows = uniqueNames(blog.tags).flatMap((name) => {
        const tagId = tagIds.get(name);
        return tagId ? [{ blog_id: row.id, tag_id: tagId }] : [];
      });

      if (tagRows.length > 0) {
        await trx("blog_tags").insert(tagRows);
      }
    }
  });

  console.log(`Seeded ${mockBlogs.length} blogs`);
}
