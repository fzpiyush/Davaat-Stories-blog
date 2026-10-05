import "server-only";

import type { Knex } from "knex";

import { slugify } from "@/lib/utils/slugify";

type TagRecord = {
  id: string;
  name: string;
  slug: string;
};

/*
 * Creates any tags that don't exist yet, then returns the ids
 * for every name. Matching ignores case, so Design reuses design.
 */
export async function ensureTagIds(
  trx: Knex.Transaction,
  names: string[],
): Promise<string[]> {
  if (names.length === 0) {
    return [];
  }

  const wanted = names.map((name) => ({
    name,
    slug: slugify(name),
    lower: name.toLowerCase(),
  }));

  for (const { name, slug } of wanted) {
    await trx.raw(
      "insert into tags (name, slug) values (?, ?) on conflict do nothing",
      [name, slug],
    );
  }

  const lowers = wanted.map((item) => item.lower);
  const found: TagRecord[] = await trx("tags")
    .select("id", "name", "slug")
    .whereIn(
      "slug",
      wanted.map((item) => item.slug),
    )
    .orWhereRaw(`lower(name) in (${lowers.map(() => "?").join(", ")})`, lowers);

  const ids = wanted.flatMap((item) => {
    const match = found.find(
      (tag) => tag.slug === item.slug || tag.name.toLowerCase() === item.lower,
    );

    return match ? [match.id] : [];
  });

  return [...new Set(ids)];
}
