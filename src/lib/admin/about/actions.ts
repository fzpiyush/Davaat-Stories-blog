"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { toBlogSections } from "@/lib/admin/editor";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { saveAboutRecord } from "@/lib/db/about";
import { aboutFormSchema } from "@/lib/validation/about";
import { validationErrorState } from "@/lib/validation/shared";

const TEXT_FIELDS = ["headline", "intro"] as const;

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function saveAbout(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const sections = formData.get("sections");

  const parsed = aboutFormSchema.safeParse({
    ...readFormText(formData, TEXT_FIELDS),
    sections: typeof sections === "string" ? parseJson(sections) : null,
    showLatest: formData.get("showLatest") === "on",
  });

  if (!parsed.success) {
    return validationErrorState(parsed.error);
  }

  const form = parsed.data;

  try {
    await saveAboutRecord({
      headline: form.headline,
      intro: form.intro,
      sections: toBlogSections(form.sections),
      showLatest: form.showLatest,
    });
  } catch (error) {
    console.error("Saving about page failed", error);
    return errorState("Couldn't save right now. Please try again.");
  }

  revalidatePath("/", "layout");

  return successState("About page saved.");
}
