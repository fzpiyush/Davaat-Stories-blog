import "server-only";

import { db } from "@/lib/db/knex";
import type { AuthorRow, MediaRow, UserRow } from "@/lib/db/types";
import { slugify } from "@/lib/utils/slugify";

const AVATAR_SIZE = 512;

export type AuthorProfile = {
  author: AuthorRow;
  avatar: { id: string; url: string; alt_text: string } | null;
};

export type AuthorProfileInput = {
  name: string;
  slug: string;
  bio: string;
  avatarMediaId: string | null;
  websiteUrl: string | null;
  instagramUrl: string | null;
  xUrl: string | null;
  linkedinUrl: string | null;
};

/* Google photo links end with a size like =s96-c, so we ask for a bigger one */
function toLargeGooglePhoto(url: string): string {
  return url.replace(/=s\d+-c$/, `=s${AVATAR_SIZE}-c`);
}

export async function getAuthor(): Promise<AuthorRow | undefined> {
  return db<AuthorRow>("authors").orderBy("created_at", "asc").first();
}

export async function getAuthorProfile(): Promise<AuthorProfile | undefined> {
  const author = await getAuthor();

  if (!author) {
    return undefined;
  }

  const avatar = author.avatar_media_id
    ? await db("media")
        .select("id", "url", "alt_text")
        .where({ id: author.avatar_media_id })
        .first()
    : null;

  return { author, avatar: avatar ?? null };
}

/*
 * There is only one author. It gets created on the first
 * admin login from the Google name and photo, then edited
 * from the admin profile page.
 */
export async function ensureAuthorProfile(user: UserRow): Promise<AuthorRow> {
  const existing = await getAuthor();

  if (existing) {
    return existing;
  }

  const name = user.name?.trim() || user.email.split("@")[0];

  return db.transaction(async (trx) => {
    let avatarMediaId: string | null = null;

    if (user.avatar_url) {
      const [media] = await trx<MediaRow>("media")
        .insert({
          url: toLargeGooglePhoto(user.avatar_url),
          alt_text: name,
          uploaded_by: user.id,
        })
        .returning("*");

      avatarMediaId = media.id;
    }

    const [author] = await trx<AuthorRow>("authors")
      .insert({
        name,
        slug: slugify(name) || "author",
        avatar_media_id: avatarMediaId,
      })
      .returning("*");

    return author;
  });
}

export async function saveAuthorProfile(
  input: AuthorProfileInput,
): Promise<void> {
  const row = {
    name: input.name,
    slug: input.slug,
    bio: input.bio,
    avatar_media_id: input.avatarMediaId,
    website_url: input.websiteUrl,
    instagram_url: input.instagramUrl,
    x_url: input.xUrl,
    linkedin_url: input.linkedinUrl,
    updated_at: new Date(),
  };

  const existing = await getAuthor();

  if (existing) {
    await db("authors").where({ id: existing.id }).update(row);
    return;
  }

  await db("authors").insert(row);
}
