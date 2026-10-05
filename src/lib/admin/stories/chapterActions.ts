"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  errorState,
  successState,
  type ActionState,
  type FieldErrors,
} from "@/lib/admin/actionState";
import { collectErrors, resolvePublishDate } from "@/lib/admin/contentRules";
import { formatAdminDateTime } from "@/lib/admin/format";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { countWords, splitParagraphs } from "@/lib/content/text";
import {
  ChapterNotFoundError,
  createChapterRecord,
  deleteChapterRecord,
  moveChapterRecord,
  StoryNotFoundError,
  updateChapterRecord,
} from "@/lib/db/stories";
import { idSchema, validationErrorState } from "@/lib/validation/shared";
import { chapterFormSchema } from "@/lib/validation/story";

const FIX_FIELDS = "Please fix the highlighted fields.";
const TEXT_FIELDS = ["title", "content", "status", "publishAt"] as const;

function storyPath(storyId: string): string {
  return `/admin/stories/${storyId}`;
}

function isValidId(value: unknown): value is string {
  return idSchema.safeParse(value).success;
}

/* Keeps the writing as typed, only tidying line endings and outer spaces */
function normalizeChapterText(text: string): string {
  return text.replace(/\r\n/g, "\n").trim();
}

export async function saveChapter(
  storyId: string,
  chapterId: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isValidId(storyId) || (chapterId !== null && !isValidId(chapterId))) {
    return errorState("This chapter could not be found.");
  }

  const parsed = chapterFormSchema.safeParse(
    readFormText(formData, TEXT_FIELDS),
  );

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;
  const content = normalizeChapterText(form.content);
  const publishedAt = resolvePublishDate(form.status, form.publishAt);
  const fieldErrors: FieldErrors = collectErrors(publishedAt);

  if (form.status !== "draft" && splitParagraphs(content).length === 0) {
    fieldErrors.content = ["Write at least one paragraph before publishing"];
  }

  if (!publishedAt.ok || Object.keys(fieldErrors).length > 0) {
    return errorState(FIX_FIELDS, fieldErrors);
  }

  const input = {
    title: form.title,
    content,
    wordCount: countWords(content),
    status: form.status,
    publishedAt: publishedAt.value,
  };

  let savedId = chapterId;

  try {
    if (chapterId) {
      await updateChapterRecord(storyId, chapterId, input);
    } else {
      savedId = await createChapterRecord(storyId, input);
    }
  } catch (error) {
    if (error instanceof StoryNotFoundError) {
      return errorState("This story was deleted. Go back to the stories list.");
    }

    if (error instanceof ChapterNotFoundError) {
      return errorState(
        "This chapter was deleted. Go back to the story and refresh.",
      );
    }

    console.error("Saving chapter failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  revalidatePath("/", "layout");

  if (!chapterId && savedId) {
    redirect(`${storyPath(storyId)}/chapters/${savedId}?created=1`);
  }

  if (form.status === "scheduled" && publishedAt.value) {
    return successState(
      `Scheduled for ${formatAdminDateTime(publishedAt.value)} IST.`,
    );
  }

  return successState(
    form.status === "published" ? "Chapter saved." : "Draft saved.",
  );
}

export async function deleteChapterAction(
  storyId: string,
  chapterId: string,
): Promise<ActionState> {
  await requireAdmin();

  if (!isValidId(storyId) || !isValidId(chapterId)) {
    return errorState("This chapter could not be found.");
  }

  try {
    await deleteChapterRecord(storyId, chapterId);
  } catch (error) {
    console.error("Deleting chapter failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect(storyPath(storyId));
}

export async function moveChapterAction(
  storyId: string,
  chapterId: string,
  direction: "up" | "down",
): Promise<void> {
  await requireAdmin();

  if (
    !isValidId(storyId) ||
    !isValidId(chapterId) ||
    (direction !== "up" && direction !== "down")
  ) {
    return;
  }

  try {
    await moveChapterRecord(storyId, chapterId, direction);
  } catch (error) {
    console.error("Moving chapter failed", error);
    return;
  }

  revalidatePath("/", "layout");
}
