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
import { toBlogSections } from "@/lib/admin/editor";
import { formatAdminDateTime } from "@/lib/admin/format";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { countSectionWords, getReadTimeMinutes } from "@/lib/content/text";
import { getAuthor } from "@/lib/db/authors";
import {
  BlogNotFoundError,
  deleteBlogRecord,
  saveBlogRecord,
} from "@/lib/db/blogs";
import {
  getConstraintName,
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/db/errors";
import { blogFormSchema } from "@/lib/validation/blog";
import { idSchema, validationErrorState } from "@/lib/validation/shared";

const BLOGS_PATH = "/admin/blogs";
const FIX_FIELDS = "Please fix the highlighted fields.";

const TEXT_FIELDS = [
  "title",
  "slug",
  "excerpt",
  "coverMediaId",
  "categoryId",
  "status",
  "publishAt",
] as const;

function isString(value: FormDataEntryValue): value is string {
  return typeof value === "string";
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readBlogForm(formData: FormData) {
  const content = formData.get("content");

  return {
    ...readFormText(formData, TEXT_FIELDS),
    content: typeof content === "string" ? parseJson(content) : null,
    tags: formData.getAll("tags").filter(isString),
    recommendations: formData.getAll("recommendations").filter(isString),
    featured: formData.get("featured") === "on",
  };
}

export async function saveBlog(
  id: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireAdmin();

  if (id !== null && !idSchema.safeParse(id).success) {
    return errorState("This blog could not be found.");
  }

  const parsed = blogFormSchema.safeParse(readBlogForm(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;
  const content = toBlogSections(form.content);

  // Existing posts keep their slug, it never regenerates by itself
  const slug: RuleResult<string> =
    id && !form.slug
      ? { ok: false, errors: { slug: ["Add a slug"] } }
      : resolveSlug(form.slug, form.title);
  const publishedAt = resolvePublishDate(form.status, form.publishAt);
  const tagNames = normalizeTagNames(form.tags);

  const fieldErrors: FieldErrors = collectErrors(slug, publishedAt, tagNames);

  if (form.status !== "draft") {
    if (!form.excerpt) {
      fieldErrors.excerpt = ["Add an excerpt before publishing"];
    }

    if (!form.coverMediaId) {
      fieldErrors.coverMediaId = ["Pick a cover before publishing"];
    }

    if (!form.categoryId) {
      fieldErrors.categoryId = ["Pick a category before publishing"];
    }

    if (!content.some((section) => section.paragraphs.length > 0)) {
      fieldErrors.content = ["Write at least one paragraph before publishing"];
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

  const recommendationIds = [...new Set(form.recommendations)].filter(
    (recommendedId) => recommendedId !== id,
  );
  const author = id ? null : await getAuthor();

  let savedId: string;

  try {
    savedId = await saveBlogRecord(
      {
        title: form.title,
        slug: slug.value,
        excerpt: form.excerpt,
        content,
        coverMediaId: form.coverMediaId,
        categoryId: form.categoryId,
        authorId: author?.id ?? null,
        status: form.status,
        publishedAt: publishedAt.value,
        isFeatured: form.featured,
        readTimeMinutes: getReadTimeMinutes(countSectionWords(content)),
        tagNames: tagNames.value,
        recommendationIds,
      },
      id,
      user.id,
    );
  } catch (error) {
    if (error instanceof BlogNotFoundError) {
      return errorState(
        "This blog was deleted. Go back to the list and refresh.",
      );
    }

    if (isUniqueViolation(error) && getConstraintName(error).includes("slug")) {
      return errorState(FIX_FIELDS, {
        slug: ["Another blog already uses this slug"],
      });
    }

    if (isForeignKeyViolation(error)) {
      return errorState(
        "The cover, category, or a recommended post was just removed. Refresh and try again.",
      );
    }

    console.error("Saving blog failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`${BLOGS_PATH}/${savedId}?created=1`);
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

export async function deleteBlogAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This blog could not be found.");
  }

  try {
    await deleteBlogRecord(id);
  } catch (error) {
    console.error("Deleting blog failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect(BLOGS_PATH);
}
