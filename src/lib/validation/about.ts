import { z } from "zod";

import { BLOG_LIMITS, sectionDraftSchema } from "@/lib/validation/blog";

export const ABOUT_LIMITS = {
  headline: 120,
  intro: 1500,
} as const;

export const aboutFormSchema = z.object({
  headline: z
    .string()
    .trim()
    .max(
      ABOUT_LIMITS.headline,
      `Keep the headline under ${ABOUT_LIMITS.headline} characters`,
    ),
  intro: z
    .string()
    .trim()
    .max(
      ABOUT_LIMITS.intro,
      `Keep the intro under ${ABOUT_LIMITS.intro} characters`,
    ),
  sections: z
    .array(
      sectionDraftSchema,
      "The sections couldn't be read. Refresh and try again.",
    )
    .max(
      BLOG_LIMITS.sections,
      `Keep it under ${BLOG_LIMITS.sections} sections`,
    ),
  showLatest: z.boolean(),
});
