import { z } from "zod";

import { countWords } from "@/lib/content/text";
import {
  contentStatusSchema,
  optionalIdSchema,
  tagNamesSchema,
} from "@/lib/validation/blog";

export const STORY_LIMITS = {
  title: 150,
  blurbWords: 1000,
  // A safety net on raw size, far above what 1,000 words needs
  blurbChars: 10000,
  chapterTitle: 150,
  chapterBody: 100000,
} as const;

export const storyProgressSchema = z.enum(["ongoing", "completed", "hiatus"]);

export const storyFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a title")
    .max(
      STORY_LIMITS.title,
      `Keep the title under ${STORY_LIMITS.title} characters`,
    ),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Keep the slug under 120 characters"),
  // Keeps line breaks so the synopsis can have paragraphs
  blurb: z
    .string()
    .transform((value) => value.replace(/\r\n?/g, "\n").trim())
    .pipe(
      z
        .string()
        .max(STORY_LIMITS.blurbChars, "This synopsis is too long")
        .refine(
          (value) => countWords(value) <= STORY_LIMITS.blurbWords,
          `Keep the synopsis under ${STORY_LIMITS.blurbWords} words`,
        ),
    ),
  coverMediaId: optionalIdSchema,
  categoryId: optionalIdSchema,
  tags: tagNamesSchema,
  progress: storyProgressSchema,
  status: contentStatusSchema,
  publishAt: z.string().trim(),
  featured: z.boolean(),
});

export const chapterFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a chapter title")
    .max(
      STORY_LIMITS.chapterTitle,
      `Keep the title under ${STORY_LIMITS.chapterTitle} characters`,
    ),
  content: z
    .string()
    .max(
      STORY_LIMITS.chapterBody,
      "This chapter is very long, try splitting it into two",
    ),
  status: contentStatusSchema,
  publishAt: z.string().trim(),
});
