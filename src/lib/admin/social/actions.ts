"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
  type FieldErrors,
} from "@/lib/admin/actionState";
import { requireAdmin } from "@/lib/auth/session";
import { replaceSocialLinks } from "@/lib/db/socialLinks";
import { socialLinksSchema } from "@/lib/validation/social";

function isString(value: FormDataEntryValue): value is string {
  return typeof value === "string";
}

export async function saveSocialLinks(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const platforms = formData.getAll("platform").filter(isString);
  const urls = formData.getAll("url").filter(isString);

  if (platforms.length !== urls.length) {
    return errorState("The links couldn't be read. Refresh and try again.");
  }

  const parsed = socialLinksSchema.safeParse(
    platforms.map((platform, index) => ({ platform, url: urls[index] })),
  );

  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};

    for (const issue of parsed.error.issues) {
      const [index, field] = issue.path;
      const key =
        typeof index === "number" && typeof field === "string"
          ? `${field}.${index}`
          : "links";

      fieldErrors[key] ??= [issue.message];
    }

    return errorState("Please fix the highlighted links.", fieldErrors);
  }

  try {
    await replaceSocialLinks(parsed.data);
  } catch (error) {
    console.error("Saving social links failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  // The footer is on every page, so everything refreshes
  revalidatePath("/", "layout");

  return successState("Social links saved.");
}
