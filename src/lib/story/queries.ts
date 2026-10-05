import "server-only";

import type { Knex } from "knex";
import { cache } from "react";

import {
  formatReadTime,
  getReadTimeMinutes,
  splitParagraphs,
} from "@/lib/content/text";
import { db } from "@/lib/db/knex";
import type { StoryProgress } from "@/lib/db/types";
import type {
  ChapterListItem,
  ChapterReading,
  StoryDetail,
  StorySummary,
} from "@/lib/story/types";

export const STORIES_PER_PAGE = 12;

const FALLBACK_AUTHOR = "The author";
const FALLBACK_CATEGORY = "Uncategorized";

// A chapter is live when it's not a draft and its time has come
const LIVE_CHAPTER =
  "ch.story_id = s.id and ch.status <> 'draft' and ch.published_at <= now()";

const TAGS_SQL = `coalesce((
  select array_agg(t.name order by lower(t.name))
  from story_tags st
  join tags t on t.id = st.tag_id
  where st.story_id = s.id
), '{}') as tags`;

// Newest story or newest chapter, whichever is more recent
const LAST_ACTIVITY_SQL = `greatest(
  s.published_at,
  coalesce((select max(ch.published_at) from chapters ch where ${LIVE_CHAPTER}), s.published_at)
) as last_activity`;

const LATEST_FIRST = [
  { column: "last_activity", order: "desc" },
  { column: "s.id", order: "desc" },
] as const;

type SummaryRow = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  progress: StoryProgress;
  published_at: Date;
  category_name: string | null;
  cover_url: string;
  tags: string[] | null;
  chapter_count: number;
  last_activity: Date;
};

type DetailRow = SummaryRow & {
  author_name: string | null;
  author_bio: string | null;
  author_avatar_url: string | null;
  word_count: number;
};

type ChapterRowLite = {
  id: string;
  number: number;
  title: string;
  published_at: Date;
  word_count: number;
};

function whereLive(builder: Knex.QueryBuilder): void {
  builder
    .whereNot("s.status", "draft")
    .where("s.published_at", "<=", db.fn.now());
}

/* Publishing requires a cover, so every live story has one */
function liveStories(): Knex.QueryBuilder {
  return db("stories as s")
    .join("media as m", "m.id", "s.cover_media_id")
    .leftJoin("categories as c", "c.id", "s.category_id")
    .modify(whereLive);
}

function selectSummary(builder: Knex.QueryBuilder): Knex.QueryBuilder {
  return builder.select(
    "s.id",
    "s.slug",
    "s.title",
    "s.blurb",
    "s.progress",
    "s.published_at",
    "c.name as category_name",
    "m.url as cover_url",
    db.raw(TAGS_SQL),
    db.raw(
      `(select count(*) from chapters ch where ${LIVE_CHAPTER})::int as chapter_count`,
    ),
    db.raw(LAST_ACTIVITY_SQL),
  );
}

function toSummary(row: SummaryRow): StorySummary {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    blurb: row.blurb,
    category: row.category_name ?? FALLBACK_CATEGORY,
    tags: row.tags ?? [],
    cover: row.cover_url,
    progress: row.progress,
    chapterCount: row.chapter_count,
    publishedAt: row.published_at.toISOString(),
    updatedAt: row.last_activity.toISOString(),
  };
}

function toChapterItem(row: ChapterRowLite): ChapterListItem {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    publishedAt: row.published_at.toISOString(),
    wordCount: row.word_count,
  };
}

/* The featured story, or the most recently updated one */
export const getFeaturedStory = cache(
  async (): Promise<StorySummary | undefined> => {
    const featured: SummaryRow | undefined = await selectSummary(liveStories())
      .where("s.is_featured", true)
      .first();

    const row: SummaryRow | undefined =
      featured ??
      (await selectSummary(liveStories())
        .orderBy([...LATEST_FIRST])
        .first());

    return row ? toSummary(row) : undefined;
  },
);

export async function getLatestStories(
  limit = 3,
  excludeSlug?: string,
): Promise<StorySummary[]> {
  const rows: SummaryRow[] = await selectSummary(liveStories())
    .modify((builder) => {
      if (excludeSlug) {
        builder.whereNot("s.slug", excludeSlug);
      }
    })
    .orderBy([...LATEST_FIRST])
    .limit(limit);

  return rows.map(toSummary);
}

export async function getStoriesPage(
  page: number,
): Promise<{ items: StorySummary[]; total: number }> {
  const [countRow, rows] = await Promise.all([
    liveStories().count({ count: "*" }).first(),
    selectSummary(liveStories())
      .orderBy([...LATEST_FIRST])
      .limit(STORIES_PER_PAGE)
      .offset((page - 1) * STORIES_PER_PAGE),
  ]);

  return {
    items: (rows as SummaryRow[]).map(toSummary),
    total: Number(countRow?.count ?? 0),
  };
}

export const getStoryBySlug = cache(
  async (slug: string): Promise<StoryDetail | undefined> => {
    const row: DetailRow | undefined = await selectSummary(liveStories())
      .leftJoin("authors as a", "a.id", "s.author_id")
      .leftJoin("media as am", "am.id", "a.avatar_media_id")
      .select(
        "a.name as author_name",
        "a.bio as author_bio",
        "am.url as author_avatar_url",
        db.raw(
          `(select coalesce(sum(ch.word_count), 0) from chapters ch where ${LIVE_CHAPTER})::int as word_count`,
        ),
      )
      .where("s.slug", slug)
      .first();

    if (!row) {
      return undefined;
    }

    return {
      ...toSummary(row),
      author: row.author_name ?? FALLBACK_AUTHOR,
      authorBio: row.author_bio ?? "",
      authorAvatarUrl: row.author_avatar_url,
      wordCount: row.word_count,
    };
  },
);

export const getLiveChapters = cache(
  async (storyId: string): Promise<ChapterListItem[]> => {
    const rows: ChapterRowLite[] = await db("chapters")
      .select("id", "number", "title", "published_at", "word_count")
      .where({ story_id: storyId })
      .whereNot("status", "draft")
      .where("published_at", "<=", db.fn.now())
      .orderBy("number", "asc");

    return rows.map(toChapterItem);
  },
);

export const getChapter = cache(
  async (
    storyId: string,
    number: number,
  ): Promise<ChapterReading | undefined> => {
    const row: (ChapterRowLite & { content: string }) | undefined = await db(
      "chapters",
    )
      .select("id", "number", "title", "published_at", "word_count", "content")
      .where({ story_id: storyId, number })
      .whereNot("status", "draft")
      .where("published_at", "<=", db.fn.now())
      .first();

    if (!row) {
      return undefined;
    }

    return {
      ...toChapterItem(row),
      paragraphs: splitParagraphs(row.content),
      readTime: formatReadTime(getReadTimeMinutes(row.word_count)),
    };
  },
);
