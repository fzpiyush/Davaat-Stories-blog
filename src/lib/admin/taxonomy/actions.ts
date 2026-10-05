"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { capitalize, formatUsage } from "@/lib/admin/format";
import { readFormText } from "@/lib/admin/forms";
import {
  isTaxonomyKind,
  TAXONOMY,
  type TaxonomyKind,
} from "@/lib/admin/taxonomy/config";
import { requireAdmin } from "@/lib/auth/session";
import {
  getConstraintName,
  isForeignKeyViolation,
  isUniqueViolation,
} from "@/lib/db/errors";
import { createTerm, deleteTerm, getTerm, updateTerm } from "@/lib/db/taxonomy";
import { slugify } from "@/lib/utils/slugify";
import {
  idSchema,
  slugSchema,
  validationErrorState,
} from "@/lib/validation/shared";
import { termFormSchema } from "@/lib/validation/taxonomy";

const FIELDS = ["name", "slug", "description"] as const;
const FIX_FIELDS = "Please fix the highlighted fields.";
const NOT_FOUND = "This item could not be found.";

/*
 * Bound arguments travel through the browser, so kind and id
 * are checked again here instead of being trusted.
 */
function isValidTarget(kind: unknown, id: string | null): kind is TaxonomyKind {
  return (
    isTaxonomyKind(kind) && (id === null || idSchema.safeParse(id).success)
  );
}

export async function saveTerm(
  kind: TaxonomyKind,
  id: string | null,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!isValidTarget(kind, id)) {
    return errorState(NOT_FOUND);
  }

  const config = TAXONOMY[kind];
  const values = readFormText(formData, FIELDS);
  const parsed = termFormSchema.safeParse(values);

  if (!parsed.success) {
    return validationErrorState(parsed.error, values);
  }

  const slugSource = parsed.data.slug || slugify(parsed.data.name);

  if (!slugSource) {
    return errorState(
      FIX_FIELDS,
      {
        slug: [
          "This name has no English letters, so add a slug like travel-notes",
        ],
      },
      values,
    );
  }

  const slug = slugSchema.safeParse(slugSource);

  if (!slug.success) {
    return errorState(
      FIX_FIELDS,
      { slug: slug.error.issues.map((issue) => issue.message) },
      values,
    );
  }

  const input = {
    name: parsed.data.name,
    slug: slug.data,
    description: config.hasDescription ? parsed.data.description : "",
  };

  try {
    if (id) {
      await updateTerm(kind, id, input);
    } else {
      await createTerm(kind, input);
    }
  } catch (error) {
    if (isUniqueViolation(error)) {
      const field = getConstraintName(error).includes("slug") ? "slug" : "name";

      return errorState(
        FIX_FIELDS,
        { [field]: [`Another ${config.singular} already uses this ${field}.`] },
        values,
      );
    }

    console.error(`Saving ${config.singular} failed`, error);
    return errorState(
      "Couldn't save right now. Please try again.",
      undefined,
      values,
    );
  }

  revalidatePath("/", "layout");

  return successState(
    id ? "Changes saved." : `${capitalize(config.singular)} added.`,
  );
}

export async function deleteTermAction(
  kind: TaxonomyKind,
  id: string,
): Promise<ActionState> {
  await requireAdmin();

  if (!isValidTarget(kind, id)) {
    return errorState(NOT_FOUND);
  }

  const config = TAXONOMY[kind];
  const term = await getTerm(kind, id);

  if (term) {
    if (term.blog_count + term.story_count > 0) {
      return errorState(
        `Still used in ${formatUsage(term.blog_count, term.story_count)}. Move those first.`,
      );
    }

    try {
      await deleteTerm(kind, id);
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        return errorState("It just got used somewhere. Refresh and try again.");
      }

      console.error(`Deleting ${config.singular} failed`, error);
      return errorState("Couldn't delete right now. Please try again.");
    }
  }

  revalidatePath("/", "layout");
  redirect(config.path);
}
