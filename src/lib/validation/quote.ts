import { z } from "zod";

import { contentStatusSchema } from "@/lib/validation/blog";

export const QUOTE_LIMITS = {
  text: 1000,
  translation: 1000,
  author: 100,
} as const;

export const quoteLangSchema = z.enum(["hi", "en"], "Pick Hindi or English");

/* Keeps line breaks, shayari needs them, but trims the edges and Windows line endings */
function multilineText(max: number, label: string) {
  return z
    .string()
    .transform((value) => value.replace(/\r\n?/g, "\n").trim())
    .pipe(z.string().max(max, `Keep the ${label} under ${max} characters`));
}

export const quoteFormSchema = z.object({
  text: multilineText(QUOTE_LIMITS.text, "quote"),
  lang: quoteLangSchema,
  translation: multilineText(QUOTE_LIMITS.translation, "translation"),
  author: z
    .string()
    .trim()
    .max(
      QUOTE_LIMITS.author,
      `Keep the author under ${QUOTE_LIMITS.author} characters`,
    ),
  status: contentStatusSchema,
  publishAt: z.string().trim(),
  featured: z.boolean(),
});
