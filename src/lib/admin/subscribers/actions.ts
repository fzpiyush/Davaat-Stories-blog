"use server";

import { revalidatePath } from "next/cache";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { requireAdmin } from "@/lib/auth/session";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/db/subscribers";
import { idSchema } from "@/lib/validation/shared";

const SUBSCRIBERS_PATH = "/admin/subscribers";

export async function setSubscriberStatusAction(
  id: string,
  status: "subscribed" | "unsubscribed",
): Promise<void> {
  await requireAdmin();

  if (
    !idSchema.safeParse(id).success ||
    (status !== "subscribed" && status !== "unsubscribed")
  ) {
    return;
  }

  try {
    await setSubscriberStatus(id, status);
  } catch (error) {
    console.error("Updating subscriber failed", error);
    return;
  }

  revalidatePath(SUBSCRIBERS_PATH);
}

export async function deleteSubscriberAction(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This subscriber could not be found.");
  }

  try {
    await deleteSubscriber(id);
  } catch (error) {
    console.error("Deleting subscriber failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  revalidatePath(SUBSCRIBERS_PATH);
  return successState("Subscriber deleted.");
}
