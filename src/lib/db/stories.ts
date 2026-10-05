import "server-only";

import type { Knex } from "knex";

import type { StatusFilter } from "@/lib/content/status";
import { db } from "@/lib/db/knex";
import { escapeLike } from "@/lib/db/sql";
import { ensureTagIds } from "@/lib/db/tagLinks";
import type {
  ChapterRow,
  ContentStatus,
  StoryProgress,
  StoryRow,
} from "@/lib/db/types";

export const STORY_PAGE_SIZE = 20;

export class StoryNotFoundError extends Error {}
export class ChapterNotFoundError extends Error {}

export type AdminStoryListItem = {
  id: string;
  slug: string;
  title: string;
  status: ContentStatus;
  progress: StoryProgress;
  published_at: Date | null;
  updated_at: Date;
  is_featured: boolean;
  category_name: string | null;
  cover_url: string | null;
  chapter_count: number;
  live_chapter_count: number;
  view_count: number;
  like_count: number;
  comment_count: number;
};

export type StoryEditorRecord = {
  story: StoryRow;
  cover: { id: string; url: string; alt_text: string } | null;
  tagNames: string[];
};

export type StorySummary = Pick<
  StoryRow,
  "id" | "title" | "slug" | "status" | "published_at"
>;

export type StorySaveInput = {
  title: string;
  slug: string;
  blurb: string;
  coverMediaId: string | null;
  categoryId: string | null;
  authorId: string | null;
  progress: StoryProgress;
  status: ContentStatus;
  publishedAt: Date | null;
  isFeatured: boolean;
  tagNames: string[];
};

export type AdminChapterItem = {
  id: string;
  number: number;
  title: string;
  status: ContentStatus;
  published_at: Date | null;
  updated_at: Date;
  word_count: number;
  view_count: number;
};

export type ChapterNeighbor = {
  id: string;
  number: number;
  title: string;
} | null;

export type ChapterSaveInput = {
  title: string;
  content: string;
  wordCount: number;
  status: ContentStatus;
  publishedAt: Date | null;
};

// Knex marks aggregate results as optional, and max is null when there are no rows
type MaxRow = { max?: number | null } | undefined;

function applyStatusFilter(
  builder: Knex.QueryBuilder,
  filter: StatusFilter,
): void {
  if (filter === "draft") {
    builder.where("s.status", "draft");
    return;
  }

  if (filter === "published") {
    builder
      .whereNot("s.status", "draft")
      .where("s.published_at", "<=", db.fn.now());
    return;
  }

  if (filter === "scheduled") {
    builder
      .whereNot("s.status", "draft")
      .where("s.published_at", ">", db.fn.now());
  }
}

async function touchStory(
  trx: Knex.Transaction,
  storyId: string,
): Promise<void> {
  await trx("stories")
    .where({ id: storyId })
    .update({ updated_at: new Date() });
}

/* Stories */

export async function listAdminStories({
  filter,
  query,
  page,
}: {
  filter: StatusFilter;
  query: string;
  page: number;
}): Promise<{ items: AdminStoryListItem[]; total: number }> {
  const filtered = db("stories as s")
    .modify(applyStatusFilter, filter)
    .modify((builder) => {
      if (query) {
        builder.whereILike("s.title", `%${escapeLike(query)}%`);
      }
    });

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .leftJoin("categories as c", "c.id", "s.category_id")
      .leftJoin("media as m", "m.id", "s.cover_media_id")
      .select(
        "s.id",
        "s.slug",
        "s.title",
        "s.status",
        "s.progress",
        "s.published_at",
        "s.updated_at",
        "s.is_featured",
        "c.name as category_name",
        "m.url as cover_url",
        db.raw(
          "(select count(*) from chapters ch where ch.story_id = s.id)::int as chapter_count",
        ),
        db.raw(
          "(select count(*) from chapters ch where ch.story_id = s.id and ch.status <> 'draft' and ch.published_at <= now())::int as live_chapter_count",
        ),
        db.raw(
          "(select count(*) from page_views pv where pv.story_id = s.id)::int as view_count",
        ),
        db.raw(
          "(select count(*) from likes l where l.story_id = s.id)::int as like_count",
        ),
        db.raw(
          "(select count(*) from comments cm where cm.story_id = s.id and not cm.is_hidden)::int as comment_count",
        ),
      )
      .orderBy("s.updated_at", "desc")
      .limit(STORY_PAGE_SIZE)
      .offset((page - 1) * STORY_PAGE_SIZE),
  ]);

  return {
    items: items as AdminStoryListItem[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getStoryStatusCounts(): Promise<
  Record<StatusFilter, number>
> {
  const row = await db("stories").first(
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

export async function getStoryForEditor(
  id: string,
): Promise<StoryEditorRecord | undefined> {
  const story = await db<StoryRow>("stories").where({ id }).first();

  if (!story) {
    return undefined;
  }

  const [cover, tagNames] = await Promise.all([
    story.cover_media_id
      ? db("media")
          .select("id", "url", "alt_text")
          .where({ id: story.cover_media_id })
          .first()
      : null,
    db("story_tags as st")
      .join("tags as t", "t.id", "st.tag_id")
      .where("st.story_id", id)
      .orderByRaw("lower(t.name) asc")
      .pluck("t.name"),
  ]);

  return { story, cover: cover ?? null, tagNames };
}

export async function getStorySummary(
  id: string,
): Promise<StorySummary | undefined> {
  return db("stories")
    .select("id", "title", "slug", "status", "published_at")
    .where({ id })
    .first();
}

export async function saveStoryRecord(
  input: StorySaveInput,
  id: string | null,
  userId: string,
): Promise<string> {
  return db.transaction(async (trx) => {
    // Only one featured story, so the old one steps down first
    if (input.isFeatured) {
      await trx("stories")
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
      blurb: input.blurb,
      cover_media_id: input.coverMediaId,
      category_id: input.categoryId,
      progress: input.progress,
      status: input.status,
      published_at: input.publishedAt,
      is_featured: input.isFeatured,
      updated_at: new Date(),
    };

    let storyId: string;

    if (id) {
      const updated = await trx("stories").where({ id }).update(row);

      if (updated === 0) {
        throw new StoryNotFoundError();
      }

      storyId = id;
    } else {
      const [created]: { id: string }[] = await trx("stories")
        .insert({ ...row, author_id: input.authorId, created_by: userId })
        .returning("id");

      storyId = created.id;
    }

    const tagIds = await ensureTagIds(trx, input.tagNames);

    await trx("story_tags").where({ story_id: storyId }).delete();

    if (tagIds.length > 0) {
      await trx("story_tags").insert(
        tagIds.map((tagId) => ({ story_id: storyId, tag_id: tagId })),
      );
    }

    return storyId;
  });
}

export async function deleteStoryRecord(id: string): Promise<void> {
  await db("stories").where({ id }).delete();
}

/* Chapters */

export async function listChaptersForStory(
  storyId: string,
): Promise<AdminChapterItem[]> {
  return db("chapters as ch")
    .select(
      "ch.id",
      "ch.number",
      "ch.title",
      "ch.status",
      "ch.published_at",
      "ch.updated_at",
      "ch.word_count",
      db.raw(
        "(select count(*) from page_views pv where pv.chapter_id = ch.id)::int as view_count",
      ),
    )
    .where("ch.story_id", storyId)
    .orderBy("ch.number", "asc");
}

export async function getChapterForEditor(
  storyId: string,
  chapterId: string,
): Promise<ChapterRow | undefined> {
  return db<ChapterRow>("chapters")
    .where({ id: chapterId, story_id: storyId })
    .first();
}

export async function getChapterNeighbors(
  storyId: string,
  number: number,
): Promise<{ previous: ChapterNeighbor; next: ChapterNeighbor }> {
  const [previous, next] = await Promise.all([
    db("chapters")
      .select("id", "number", "title")
      .where({ story_id: storyId })
      .where("number", "<", number)
      .orderBy("number", "desc")
      .first(),
    db("chapters")
      .select("id", "number", "title")
      .where({ story_id: storyId })
      .where("number", ">", number)
      .orderBy("number", "asc")
      .first(),
  ]);

  return { previous: previous ?? null, next: next ?? null };
}

export async function getNextChapterNumber(storyId: string): Promise<number> {
  const row: MaxRow = await db("chapters")
    .where({ story_id: storyId })
    .max({ max: "number" })
    .first();

  return (row?.max ?? 0) + 1;
}

export async function createChapterRecord(
  storyId: string,
  input: ChapterSaveInput,
): Promise<string> {
  return db.transaction(async (trx) => {
    // Locks the story so two new chapters can't grab the same number
    const story = await trx("stories")
      .where({ id: storyId })
      .forUpdate()
      .first("id");

    if (!story) {
      throw new StoryNotFoundError();
    }

    const row: MaxRow = await trx("chapters")
      .where({ story_id: storyId })
      .max({ max: "number" })
      .first();

    const [created]: { id: string }[] = await trx("chapters")
      .insert({
        story_id: storyId,
        number: (row?.max ?? 0) + 1,
        title: input.title,
        content: input.content,
        word_count: input.wordCount,
        status: input.status,
        published_at: input.publishedAt,
      })
      .returning("id");

    await touchStory(trx, storyId);

    return created.id;
  });
}

export async function updateChapterRecord(
  storyId: string,
  chapterId: string,
  input: ChapterSaveInput,
): Promise<void> {
  await db.transaction(async (trx) => {
    const updated = await trx("chapters")
      .where({ id: chapterId, story_id: storyId })
      .update({
        title: input.title,
        content: input.content,
        word_count: input.wordCount,
        status: input.status,
        published_at: input.publishedAt,
        updated_at: new Date(),
      });

    if (updated === 0) {
      throw new ChapterNotFoundError();
    }

    await touchStory(trx, storyId);
  });
}

/* Deletes a chapter and closes the gap, so 4 becomes 3 and so on */
export async function deleteChapterRecord(
  storyId: string,
  chapterId: string,
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx("stories").where({ id: storyId }).forUpdate().first("id");

    const chapter: { number: number } | undefined = await trx("chapters")
      .where({ id: chapterId, story_id: storyId })
      .first("number");

    if (!chapter) {
      return;
    }

    await trx("chapters").where({ id: chapterId }).delete();

    await trx("chapters")
      .where({ story_id: storyId })
      .where("number", ">", chapter.number)
      .decrement("number", 1);

    await touchStory(trx, storyId);
  });
}

/* Swaps a chapter with its neighbour. The deferred unique rule allows the swap */
export async function moveChapterRecord(
  storyId: string,
  chapterId: string,
  direction: "up" | "down",
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx("stories").where({ id: storyId }).forUpdate().first("id");

    const chapter: { id: string; number: number } | undefined = await trx(
      "chapters",
    )
      .where({ id: chapterId, story_id: storyId })
      .first("id", "number");

    if (!chapter) {
      return;
    }

    const neighbor: { id: string; number: number } | undefined = await trx(
      "chapters",
    )
      .where({ story_id: storyId })
      .where("number", direction === "up" ? "<" : ">", chapter.number)
      .orderBy("number", direction === "up" ? "desc" : "asc")
      .first("id", "number");

    if (!neighbor) {
      return;
    }

    await trx("chapters")
      .where({ id: chapter.id })
      .update({ number: neighbor.number });
    await trx("chapters")
      .where({ id: neighbor.id })
      .update({ number: chapter.number });
  });
}
