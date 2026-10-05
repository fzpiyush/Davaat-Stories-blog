import { z } from "zod";

import {
  errorState,
  type ActionState,
  type FormValues,
} from "@/lib/admin/actionState";

export const idSchema = z.uuid();

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Add a slug")
  .max(120, "Keep the slug under 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use only lowercase letters, numbers, and single dashes",
  );

export const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "That link is too long")
  .refine(
    (value) => value === "" || /^https?:\/\/\S+$/i.test(value),
    "Enter a full link starting with https://",
  )
  .transform((value) => value || null);

export function validationErrorState(
  error: z.ZodError,
  values?: FormValues,
): ActionState {
  return errorState(
    "Please fix the highlighted fields.",
    z.flattenError(error).fieldErrors,
    values,
  );
}
