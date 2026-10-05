"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  errorState,
  successState,
  type ActionState,
} from "@/lib/admin/actionState";
import { pluralize } from "@/lib/admin/format";
import { readFormText } from "@/lib/admin/forms";
import { requireAdmin } from "@/lib/auth/session";
import { isForeignKeyViolation } from "@/lib/db/errors";
import {
  deleteMediaRow,
  getMediaById,
  insertMedia,
  setMediaAltText,
} from "@/lib/db/media";
import type { MediaRow } from "@/lib/db/types";
import {
  IMAGE_PRESETS,
  isImagePresetKey,
  MAX_SOURCE_BYTES,
  MAX_UPLOAD_BYTES,
  OUTPUT_IMAGE_TYPES,
  type ImagePresetKey,
} from "@/lib/media/presets";
import { getStorageBucket, getSupabaseAdmin } from "@/lib/storage/supabase";
import { idSchema, validationErrorState } from "@/lib/validation/shared";

const MEDIA_PATH = "/admin/media";

// Must match the folders in IMAGE_PRESETS
const STORAGE_PATH_PATTERN =
  /^(blogs|stories|authors)\/\d{4}\/\d{2}\/[0-9a-f-]{36}\.(webp|jpg)$/;

const presetSchema = z.custom<ImagePresetKey>(
  (value) => typeof value === "string" && isImagePresetKey(value),
);

const uploadRequestSchema = z.object({
  preset: presetSchema,
  mimeType: z.enum(OUTPUT_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
});

const finalizeSchema = z.object({
  path: z.string().regex(STORAGE_PATH_PATTERN),
  mimeType: z.enum(OUTPUT_IMAGE_TYPES),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  originalSize: z.number().int().positive().max(MAX_SOURCE_BYTES),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  originalName: z.string().trim().max(255),
  altText: z.string().trim().max(300),
});

const altSchema = z.object({
  altText: z.string().trim().max(300, "Keep it under 300 characters"),
});

export type UploadTicket = {
  bucket: string;
  path: string;
  token: string;
};

export type UploadTicketResult =
  | { ok: true; ticket: UploadTicket }
  | { ok: false; message: string };

export type MediaResult =
  | { ok: true; media: MediaRow }
  | { ok: false; message: string };

function buildStoragePath(preset: ImagePresetKey, mimeType: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const extension = mimeType === "image/webp" ? "webp" : "jpg";

  return `${IMAGE_PRESETS[preset].folder}/${year}/${month}/${randomUUID()}.${extension}`;
}

async function storageObjectExists(path: string): Promise<boolean> {
  const slash = path.lastIndexOf("/");
  const folder = path.slice(0, slash);
  const name = path.slice(slash + 1);

  const { data, error } = await getSupabaseAdmin()
    .storage.from(getStorageBucket())
    .list(folder, { search: name, limit: 1 });

  return !error && data.some((file) => file.name === name);
}

/* Step 1. Gives the browser a one time link to upload straight to storage */
export async function createMediaUpload(
  input: unknown,
): Promise<UploadTicketResult> {
  await requireAdmin();

  const parsed = uploadRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "This file can't be uploaded. Check its type and size.",
    };
  }

  const bucket = getStorageBucket();
  const path = buildStoragePath(parsed.data.preset, parsed.data.mimeType);

  const { data, error } = await getSupabaseAdmin()
    .storage.from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    console.error("Could not create signed upload", error);
    return {
      ok: false,
      message: "Couldn't prepare the upload. Please try again.",
    };
  }

  return { ok: true, ticket: { bucket, path: data.path, token: data.token } };
}

/* Step 2. After the upload, checks the file is there and saves it to the library */
export async function finalizeMediaUpload(
  input: unknown,
): Promise<MediaResult> {
  const { user } = await requireAdmin();
  const parsed = finalizeSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: "The upload details didn't look right. Please try again.",
    };
  }

  const {
    path,
    mimeType,
    size,
    originalSize,
    width,
    height,
    originalName,
    altText,
  } = parsed.data;

  const extensionMatches =
    (mimeType === "image/webp") === path.endsWith(".webp");

  if (!extensionMatches || !(await storageObjectExists(path))) {
    return {
      ok: false,
      message: "The file didn't reach storage. Please try again.",
    };
  }

  const { data } = getSupabaseAdmin()
    .storage.from(getStorageBucket())
    .getPublicUrl(path);

  const media = await insertMedia({
    storage_path: path,
    url: data.publicUrl,
    alt_text: altText,
    original_name: originalName || null,
    mime_type: mimeType,
    size_bytes: size,
    original_size_bytes: originalSize,
    width,
    height,
    uploaded_by: user.id,
  });

  revalidatePath(MEDIA_PATH);

  return { ok: true, media };
}

export async function updateMediaAlt(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This image no longer exists.");
  }

  const values = readFormText(formData, ["altText"]);
  const parsed = altSchema.safeParse(values);

  if (!parsed.success) {
    return validationErrorState(parsed.error, values);
  }

  await setMediaAltText(id, parsed.data.altText);
  revalidatePath(MEDIA_PATH);

  return successState("Saved");
}

export async function deleteMedia(id: string): Promise<ActionState> {
  await requireAdmin();

  if (!idSchema.safeParse(id).success) {
    return errorState("This image no longer exists.");
  }

  const media = await getMediaById(id);

  if (!media) {
    revalidatePath(MEDIA_PATH);
    return errorState("This image was already deleted.");
  }

  if (media.usage_count > 0) {
    return errorState(
      `Used in ${pluralize(media.usage_count, "place")}. Swap it out there first.`,
    );
  }

  try {
    await deleteMediaRow(id);
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return errorState(
        "This image just got used somewhere. Swap it out first.",
      );
    }

    console.error("Deleting media failed", error);
    return errorState("Couldn't delete right now. Please try again.");
  }

  // The library row is gone, so a failed file cleanup is only logged
  if (media.storage_path) {
    const { error } = await getSupabaseAdmin()
      .storage.from(getStorageBucket())
      .remove([media.storage_path]);

    if (error) {
      console.error("Storage cleanup failed", media.storage_path, error);
    }
  }

  revalidatePath(MEDIA_PATH);

  return successState("Image deleted.");
}
