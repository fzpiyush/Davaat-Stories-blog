import { z } from "zod";

import { optionalIdSchema } from "@/lib/validation/blog";
import { optionalUrlSchema } from "@/lib/validation/shared";

export const PROFILE_LIMITS = {
  name: 80,
  bio: 600,
} as const;

export const profileFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add your name")
    .max(PROFILE_LIMITS.name, `Keep your name under ${PROFILE_LIMITS.name} characters`),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "Keep the slug under 120 characters"),
  bio: z
    .string()
    .trim()
    .max(PROFILE_LIMITS.bio, `Keep your bio under ${PROFILE_LIMITS.bio} characters`),
  avatarMediaId: optionalIdSchema,
  websiteUrl: optionalUrlSchema,
  instagramUrl: optionalUrlSchema,
  xUrl: optionalUrlSchema,
  linkedinUrl: optionalUrlSchema,
});