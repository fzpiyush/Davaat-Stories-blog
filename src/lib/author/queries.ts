import "server-only";

import { cache } from "react";

import { getAuthorProfile } from "@/lib/db/authors";
import { getSocialLinks, type PublicSocialLink } from "@/lib/social/queries";

export type PublicAuthor = {
  name: string;
  bio: string;
  avatarUrl: string | null;
  links: PublicSocialLink[];
};

/* There is only one author, so the about page is their page */
export const getPublicAuthor = cache(
  async (): Promise<PublicAuthor | undefined> => {
    const [profile, links] = await Promise.all([
      getAuthorProfile(),
      getSocialLinks(),
    ]);

    if (!profile) {
      return undefined;
    }

    return {
      name: profile.author.name,
      bio: profile.author.bio ?? "",
      avatarUrl: profile.avatar?.url ?? null,
      links,
    };
  },
);
