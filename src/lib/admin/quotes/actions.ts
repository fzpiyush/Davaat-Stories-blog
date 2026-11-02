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
import {
  deleteQuoteRecord,
  QuoteNotFoundError,
  saveQuoteRecord,
} from "@/lib/db/quotes";
import { quoteFormSchema } from "@/lib/validation/quote";
import { idSchema, validationErrorState } from "@/lib/validation/shared";

const QUOTES_PATH = "/admin/quotes";
const FIX_FIELDS = "Please fix the highlighted fields.";

const TEXT_FIELDS = [
  "text",
  "lang",
  "translation",
  "author",
  "status",
  "publishAt",
] as const;

function readQuoteForm(formData: FormData) {
  return {
    ...readFormText(formData, TEXT_FIELDS),
    featured: formData.get("featured") === "on",
  };
}

export async function saveQuote(
  id: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { user } = await requireAdmin();

  if (id !== null && !idSchema.safeParse(id).success) {
    return errorState("This quote could not be found.");
  }

  const parsed = quoteFormSchema.safeParse(readQuoteForm(formData));

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;
  const publishedAt = resolvePublishDate(form.status, form.publishAt);
  const fieldErrors: FieldErrors = collectErrors(publishedAt);

  if (form.status !== "draft" && !form.text) {
    fieldErrors.text = ["Write the quote before publishing"];
  }

  if (!publishedAt.ok || Object.keys(fieldErrors).length > 0) {
    return errorState(FIX_FIELDS, fieldErrors);
  }

  let savedId: string;

  try {
    savedId = await saveQuoteRecord(
      {
        text: form.text,
        lang: form.lang,
        translation: form.translation,
        author: form.author,
        status: form.status,
        publishedAt: publishedAt.value,
        isFeatured: form.featured,
      },
      id,
      user.id,
    );
  } catch (error) {
    if (error instanceof QuoteNotFoundError) {
      return errorState(
        "This quote was deleted. Go back to the list and refresh.",
      );
    }

    console.error("Saving quote failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  revalidatePath("/", "layout");

  if (!id) {
    redirect(`${QUOTES_PATH}/${savedId}?created=1`);
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

export async function deleteQuoteAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This quote could not be found.");
  }

  try {
    await deleteQuoteRecord(id);
  } catch (error) {
    console.error("Deleting quote failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath("/", "layout");
  redirect(QUOTES_PATH);
}
