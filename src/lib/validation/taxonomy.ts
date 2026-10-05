import { z } from "zod";

export const termFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add a name")
    .max(60, "Keep the name under 60 characters"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Keep the slug under 120 characters"),
  description: z
    .string()
    .trim()
    .max(300, "Keep the description under 300 characters"),
});
