export type ImagePresetKey = "blogCover" | "storyCover" | "avatar";

export type ImagePreset = {
  label: string;
  folder: string;
  maxWidth: number;
  maxHeight: number;
  quality: number;
  /** Width divided by height. Null keeps the original shape */
  aspectRatio: number | null;
};

export const IMAGE_PRESETS = {
  blogCover: {
    label: "Blog cover",
    folder: "blogs",
    maxWidth: 2400,
    maxHeight: 1600,
    quality: 0.8,
    aspectRatio: null,
  },
  storyCover: {
    label: "Story cover",
    folder: "stories",
    maxWidth: 900,
    maxHeight: 1200,
    quality: 0.85,
    aspectRatio: 3 / 4,
  },
  avatar: {
    label: "Author photo",
    folder: "authors",
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.8,
    aspectRatio: 1,
  },
} as const satisfies Record<ImagePresetKey, ImagePreset>;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

// What you can pick, checked before conversion
export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;

// What can be uploaded, checked after conversion
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

// WebP first, JPG only if the browser can't make WebP
export const OUTPUT_IMAGE_TYPES = ["image/webp", "image/jpeg"] as const;

export function isImagePresetKey(value: string): value is ImagePresetKey {
  return value in IMAGE_PRESETS;
}
