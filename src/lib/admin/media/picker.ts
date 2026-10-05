"use server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth/session";
import { listMedia, MEDIA_PAGE_SIZE } from "@/lib/db/media";

export type PickerMedia = {
  id: string;
  url: string;
  alt_text: string;
  width: number | null;
  height: number | null;
};

const pickerQuerySchema = z.object({
  query: z.string().trim().max(100),
  page: z.number().int().min(1).max(1000),
});

export async function listMediaForPicker(
  input: unknown,
): Promise<{ items: PickerMedia[]; hasMore: boolean }> {
  await requireAdmin();

  const parsed = pickerQuerySchema.safeParse(input);

  if (!parsed.success) {
    return { items: [], hasMore: false };
  }

  const { items, total } = await listMedia(parsed.data);

  return {
    items: items.map(({ id, url, alt_text, width, height }) => ({
      id,
      url,
      alt_text,
      width,
      height,
    })),
    hasMore: parsed.data.page * MEDIA_PAGE_SIZE < total,
  };
}
