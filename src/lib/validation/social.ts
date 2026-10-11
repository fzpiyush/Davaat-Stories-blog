import { z } from "zod";

import { MAX_SOCIAL_LINKS, SOCIAL_PLATFORMS } from "@/lib/social/platforms";

export const socialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS, "Pick a platform"),
  url: z
    .string()
    .trim()
    .min(1, "Add the link")
    .max(500, "That link is too long")
    .regex(/^https?:\/\/\S+$/i, "Enter a full link starting with https://"),
});

export const socialLinksSchema = z
  .array(socialLinkSchema)
  .max(MAX_SOCIAL_LINKS, `Keep it to ${MAX_SOCIAL_LINKS} links`);
