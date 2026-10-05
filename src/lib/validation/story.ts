import { z } from "zod";

import {
  contentStatusSchema,
  optionalIdSchema,
  tagNamesSchema,
} from "@/lib/validation/blog";

export const STORY_LIMITS = {
  title: 150,
  blurb: 600,
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
  blurb: z
    .string()
    .trim()
    .max(
      STORY_LIMITS.blurb,
      `Keep the blurb under ${STORY_LIMITS.blurb} characters`,
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
