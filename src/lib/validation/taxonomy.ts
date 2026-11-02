import { z } from "zod";

export const TERM_LIMITS = {
  name: 100,
  slug: 120,
  description: 300,
} as const;

export const termFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add a name")
    .max(
      TERM_LIMITS.name,
      `Keep the name under ${TERM_LIMITS.name} characters`,
    ),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(
      TERM_LIMITS.slug,
      `Keep the slug under ${TERM_LIMITS.slug} characters`,
    ),
  description: z
    .string()
    .trim()
    .max(
      TERM_LIMITS.description,
      `Keep the description under ${TERM_LIMITS.description} characters`,
    ),
});
