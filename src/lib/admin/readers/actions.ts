"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/session";
import { setReaderBlocked } from "@/lib/db/readers";
import { idSchema } from "@/lib/validation/shared";

export async function setReaderBlockedAction(
  userId: string,
  blocked: boolean,
): Promise<void> {
  await requireAdmin();

  if (!idSchema.safeParse(userId).success || typeof blocked !== "boolean") {
    return;
  }

  try {
    await setReaderBlocked(userId, blocked);
  } catch (error) {
    console.error("Updating reader failed", error);
    return;
  }

  revalidatePath("/admin", "layout");
}
