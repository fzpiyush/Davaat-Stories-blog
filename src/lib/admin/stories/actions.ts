"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  errorState,
  successState,
  type ActionState,
  type FieldErrors,
} from "@/lib/admin/actionState";
import {
  collectErrors,
  normalizeTagNames,
  resolvePublishDate,
  resolveSlug,
  type RuleResult,
} from "@/lib/admin/contentRules";
import { formatAdminDateTime } from "@/lib/admin/format";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { getAuthor } from "@/lib/db/authors";
import {
  getConstraintName,
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/db/errors";
import {
  deleteStoryRecord,
  saveStoryRecord,
  StoryNotFoundError,
} from "@/lib/db/stories";
import { idSchema, validationErrorState } from "@/lib/validation/shared";
import { storyFormSchema } from "@/lib/validation/story";

const STORIES_PATH = "/admin/stories";
const FIX_FIELDS = "Please fix the highlighted fields.";

const TEXT_FIELDS = [
  "title",
  "slug",
  "blurb",
  "coverMediaId",
  "categoryId",
  "progress",
  "status",
  "publishAt",
] as const;

function isString(value: FormDataEntryValue): value is string {
  return typeof value === "string";
}

function readStoryForm(formData: FormData) {
  return {
    ...readFormText(formData, TEXT_FIELDS),
    tags: formData.getAll("tags").filter(isString),
    featured: formData.get("featured") === "on",
  };
}

export async function saveStory(
  id: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireAdmin();

  if (id !== null && !idSchema.safeParse(id).success) {
    return errorState("This story could not be found.");
  }

  const parsed = storyFormSchema.safeParse(readStoryForm(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;

  // Existing stories keep their slug, it never regenerates by itself
  const slug: RuleResult<string> =
    id && !form.slug
      ? { ok: false, errors: { slug: ["Add a slug"] } }
      : resolveSlug(form.slug, form.title);
  const publishedAt = resolvePublishDate(form.status, form.publishAt);
  const tagNames = normalizeTagNames(form.tags);

  const fieldErrors: FieldErrors = collectErrors(slug, publishedAt, tagNames);

  if (form.status !== "draft") {
    if (!form.blurb) {
      fieldErrors.blurb = ["Add a blurb before publishing"];
    }

    if (!form.coverMediaId) {
      fieldErrors.coverMediaId = ["Pick a cover before publishing"];
    }

    if (!form.categoryId) {
      fieldErrors.categoryId = ["Pick a category before publishing"];
    }
  }

  if (
    !slug.ok ||
    !publishedAt.ok ||
    !tagNames.ok ||
    Object.keys(fieldErrors).length > 0
  ) {
    return errorState(FIX_FIELDS, fieldErrors);
  }

  const author = id ? null : await getAuthor();

  let savedId: string;

  try {
    savedId = await saveStoryRecord(
      {
        title: form.title,
        slug: slug.value,
        blurb: form.blurb,
        coverMediaId: form.coverMediaId,
        categoryId: form.categoryId,
        authorId: author?.id ?? null,
        progress: form.progress,
        status: form.status,
        publishedAt: publishedAt.value,
        isFeatured: form.featured,
        tagNames: tagNames.value,
      },
      id,
      user.id,
    );
  } catch (error) {
    if (error instanceof StoryNotFoundError) {
      return errorState(
        "This story was deleted. Go back to the list and refresh.",
      );
    }

    if (isUniqueViolation(error) && getConstraintName(error).includes("slug")) {
      return errorState(FIX_FIELDS, {
        slug: ["Another story already uses this slug"],
      });
    }

    if (isForeignKeyViolation(error)) {
      return errorState(
        "The cover or category was just removed. Refresh and try again.",
      );
    }

    console.error("Saving story failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`${STORIES_PATH}/${savedId}?created=1`);
  }

  if (form.status === "scheduled" && publishedAt.value) {
    return successState(
      `Scheduled for ${formatAdminDateTime(publishedAt.value)} IST.`,
    );
  }

  return successState(
    form.status === "published"
      ? "Saved. It's live on the site."
      : "Draft saved.",
  );
}

export async function deleteStoryAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This story could not be found.");
  }

  try {
    await deleteStoryRecord(id);
  } catch (error) {
    console.error("Deleting story failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect(STORIES_PATH);
}
