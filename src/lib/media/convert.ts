import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_PRESETS,
  MAX_SOURCE_BYTES,
  type ImagePresetKey,
} from "@/lib/media/presets";

export type ConvertedImage = {
  blob: Blob;
  width: number;
  height: number;
  type: "image/webp" | "image/jpeg";
};

type CropBox = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
};

export class ImageConvertError extends Error {}

export function validateSourceFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Pick a JPG, PNG, WebP, or AVIF image.";
  }

  if (file.size > MAX_SOURCE_BYTES) {
    return "This image is over 20 MB. Pick a smaller one.";
  }

  return null;
}

/* Cuts the largest centered area that matches the wanted shape */
function getCropBox(
  width: number,
  height: number,
  aspectRatio: number | null,
): CropBox {
  if (!aspectRatio) {
    return { sx: 0, sy: 0, sw: width, sh: height };
  }

  if (width / height > aspectRatio) {
    const sw = Math.round(height * aspectRatio);
    return { sx: Math.round((width - sw) / 2), sy: 0, sw, sh: height };
  }

  const sh = Math.round(width / aspectRatio);
  return { sx: 0, sy: Math.round((height - sh) / 2), sw: width, sh };
}

/* Shrinks to fit the box, never stretches a small image up */
function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function convertImage(
  file: File,
  presetKey: ImagePresetKey,
): Promise<ConvertedImage> {
  const preset = IMAGE_PRESETS[presetKey];
  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new ImageConvertError(
      "This image couldn't be read. Try a JPG or PNG.",
    );
  }

  try {
    const crop = getCropBox(bitmap.width, bitmap.height, preset.aspectRatio);
    const size = fitWithin(crop.sw, crop.sh, preset.maxWidth, preset.maxHeight);

    const canvas = document.createElement("canvas");
    canvas.width = size.width;
    canvas.height = size.height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new ImageConvertError("Your browser couldn't process this image.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      bitmap,
      crop.sx,
      crop.sy,
      crop.sw,
      crop.sh,
      0,
      0,
      size.width,
      size.height,
    );

    const webp = await canvasToBlob(canvas, "image/webp", preset.quality);

    if (webp && webp.type === "image/webp") {
      return { blob: webp, ...size, type: "image/webp" };
    }

    // JPG has no transparency, so a white background goes behind the image
    context.globalCompositeOperation = "destination-over";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, size.width, size.height);

    const jpeg = await canvasToBlob(canvas, "image/jpeg", preset.quality);

    if (!jpeg) {
      throw new ImageConvertError("Your browser couldn't convert this image.");
    }

    return { blob: jpeg, ...size, type: "image/jpeg" };
  } finally {
    bitmap.close();
  }
}
