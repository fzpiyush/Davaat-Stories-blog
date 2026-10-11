import "server-only";

import { db } from "@/lib/db/knex";
import type { SocialLinkRow, SocialPlatform } from "@/lib/db/types";

export type SocialLinkInput = {
  platform: SocialPlatform;
  url: string;
};

export async function listSocialLinks(): Promise<SocialLinkRow[]> {
  return db<SocialLinkRow>("social_links").orderBy([
    { column: "position", order: "asc" },
    { column: "created_at", order: "asc" },
  ]);
}

export async function replaceSocialLinks(
  links: SocialLinkInput[],
): Promise<void> {
  await db.transaction(async (trx) => {
    await trx("social_links").del();

    if (links.length === 0) {
      return;
    }

    await trx("social_links").insert(
      links.map((link, position) => ({
        platform: link.platform,
        url: link.url,
        position,
      })),
    );
  });
}
