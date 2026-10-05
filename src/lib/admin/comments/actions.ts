"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { requireAdmin } from "@/lib/auth/session";
import { deleteComment, setCommentHidden } from "@/lib/db/comments";
import { idSchema } from "@/lib/validation/shared";

export async function setCommentHiddenAction(
  id: string,
  hidden: boolean,
): Promise<void> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success || typeof hidden !== "boolean") {
    return;
  }

  try {
    await setCommentHidden(id, hidden);
  } catch (error) {
    console.error("Updating comment failed", error);
    return;
  }

  revalidatePath("/", "layout");
}

export async function deleteCommentAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This comment could not be found.");
  }

  try {
    await deleteComment(id);
  } catch (error) {
    console.error("Deleting comment failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath("/", "layout");
  return successState("Comment deleted.");
}
