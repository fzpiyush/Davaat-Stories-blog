import "server-only";

import { db } from "@/lib/db/knex";
import type { MediaRow } from "@/lib/db/types";

export const MEDIA_PAGE_SIZE = 24;

export type MediaWithUsage = MediaRow & { usage_count: number };
export type NewMedia = Omit<MediaRow, "id" | "created_at">;

const USAGE_SQL = `(
  (select count(*) from blogs b where b.cover_media_id = media.id)
  + (select count(*) from stories s where s.cover_media_id = media.id)
  + (select count(*) from authors a where a.avatar_media_id = media.id)
)::int as usage_count`;

// Stops % and _ in a search from acting as wildcards
function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

export async function listMedia({
  page,
  query,
}: {
  page: number;
  query: string;
}): Promise<{ items: MediaWithUsage[]; total: number }> {
  const filtered = db("media").modify((builder) => {
    if (query) {
      const pattern = `%${escapeLike(query)}%`;

      builder.where((inner) => {
        inner
          .whereILike("alt_text", pattern)
          .orWhereILike("original_name", pattern);
      });
    }
  });

  const [countRow, items] = await Promise.all([
    filtered.clone().count({ count: "*" }).first(),
    filtered
      .clone()
      .select("media.*", db.raw(USAGE_SQL))
      .orderBy("created_at", "desc")
      .limit(MEDIA_PAGE_SIZE)
      .offset((page - 1) * MEDIA_PAGE_SIZE),
  ]);

  return {
    items: items as MediaWithUsage[],
    total: Number(countRow?.count ?? 0),
  };
}

export async function getMediaById(
  id: string,
): Promise<MediaWithUsage | undefined> {
  return db("media")
    .select("media.*", db.raw(USAGE_SQL))
    .where("media.id", id)
    .first();
}

export async function insertMedia(input: NewMedia): Promise<MediaRow> {
  const [media] = await db<MediaRow>("media").insert(input).returning("*");

  if (!media) {
    throw new Error("Failed to save media");
  }

  return media;
}

export async function setMediaAltText(
  id: string,
  altText: string,
): Promise<void> {
  await db<MediaRow>("media").where({ id }).update({ alt_text: altText });
}

export async function deleteMediaRow(id: string): Promise<void> {
  await db<MediaRow>("media").where({ id }).delete();
}
