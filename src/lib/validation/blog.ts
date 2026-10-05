import { z } from "zod";

export const BLOG_LIMITS = {
  title: 150,
  excerpt: 300,
  sections: 50,
  heading: 150,
  body: 20000,
  quote: 500,
  tags: 10,
  tagName: 40,
  recommendations: 3,
} as const;

export const optionalIdSchema = z
  .union([z.literal(""), z.uuid()])
  .transform((value) => value || null);

export const sectionDraftSchema = z.object({
  heading: z
    .string()
    .trim()
    .max(
      BLOG_LIMITS.heading,
      `Keep section headings under ${BLOG_LIMITS.heading} characters`,
    ),
  body: z
    .string()
    .max(BLOG_LIMITS.body, "Keep each section under 20,000 characters"),
  quote: z
    .string()
    .trim()
    .max(
      BLOG_LIMITS.quote,
      `Keep quotes under ${BLOG_LIMITS.quote} characters`,
    ),
});

export const contentStatusSchema = z.enum(["draft", "published", "scheduled"]);

export const tagNamesSchema = z
  .array(
    z
      .string()
      .trim()
      .max(
        BLOG_LIMITS.tagName,
        `Keep each tag under ${BLOG_LIMITS.tagName} characters`,
      ),
  )
  .max(BLOG_LIMITS.tags, `Use up to ${BLOG_LIMITS.tags} tags`);

export const blogFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Add a title")
    .max(
      BLOG_LIMITS.title,
      `Keep the title under ${BLOG_LIMITS.title} characters`,
    ),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Keep the slug under 120 characters"),
  excerpt: z
    .string()
    .trim()
    .max(
      BLOG_LIMITS.excerpt,
      `Keep the excerpt under ${BLOG_LIMITS.excerpt} characters`,
    ),
  content: z
    .array(
      sectionDraftSchema,
      "The content couldn't be read. Refresh and try again.",
    )
    .max(
      BLOG_LIMITS.sections,
      `Keep it under ${BLOG_LIMITS.sections} sections`,
    ),
  coverMediaId: optionalIdSchema,
  categoryId: optionalIdSchema,
  tags: tagNamesSchema,
  recommendations: z
    .array(z.uuid())
    .max(
      BLOG_LIMITS.recommendations,
      `Pick up to ${BLOG_LIMITS.recommendations} recommended posts`,
    ),
  status: contentStatusSchema,
  publishAt: z.string().trim(),
  featured: z.boolean(),
});
