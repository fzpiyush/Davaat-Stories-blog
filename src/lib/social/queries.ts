import "server-only";

import { cache } from "react";

import { listSocialLinks } from "@/lib/db/socialLinks";
import type { SocialPlatform } from "@/lib/db/types";
import { SOCIAL_PLATFORM_LABEL } from "@/lib/social/platforms";

export type PublicSocialLink = {
  id: string;
  platform: SocialPlatform;
  label: string;
  href: string;
};

export const getSocialLinks = cache(async (): Promise<PublicSocialLink[]> => {
  const rows = await listSocialLinks();

  return rows.map((row) => ({
    id: row.id,
    platform: row.platform,
    label: SOCIAL_PLATFORM_LABEL[row.platform],
    href: row.url,
  }));
});
