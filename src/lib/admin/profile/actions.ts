"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { resolveSlug } from "@/lib/admin/contentRules";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { saveAuthorProfile } from "@/lib/db/authors";
import { isForeignKeyViolation, isUniqueViolation } from "@/lib/db/errors";
import { profileFormSchema } from "@/lib/validation/profile";
import { validationErrorState } from "@/lib/validation/shared";

const FIX_FIELDS = "Please fix the highlighted fields.";

const FIELDS = [
  "name",
  "slug",
  "bio",
  "avatarMediaId",
  "websiteUrl",
  "instagramUrl",
  "xUrl",
  "linkedinUrl",
] as const;

export async function saveProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = profileFormSchema.safeParse(readFormText(formData, FIELDS));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;
  const slug = resolveSlug(form.slug, form.name);

  if (!slug.ok) {
    return errorState(FIX_FIELDS, slug.errors);
  }

  try {
    await saveAuthorProfile({
      name: form.name,
      slug: slug.value,
      bio: form.bio,
      avatarMediaId: form.avatarMediaId,
      websiteUrl: form.websiteUrl,
      instagramUrl: form.instagramUrl,
      xUrl: form.xUrl,
      linkedinUrl: form.linkedinUrl,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return errorState(FIX_FIELDS, { slug: ["That slug is already taken"] });
    }

    if (isForeignKeyViolation(error)) {
      return errorState("That photo was just removed. Pick another one.");
    }

    console.error("Saving profile failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  // Your name and bio show on every blog, so everything refreshes
  revalidatePath("/", "layout");

  return successState("Profile saved. It shows on every post now.");
}
