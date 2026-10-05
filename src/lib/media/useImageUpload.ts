"use client";

import { useCallback, useState } from "react";

import {
  createMediaUpload,
  finalizeMediaUpload,
} from "@/lib/admin/media/actions";
import type { MediaRow } from "@/lib/db/types";
import { convertImage, validateSourceFile } from "@/lib/media/convert";
import { MAX_UPLOAD_BYTES, type ImagePresetKey } from "@/lib/media/presets";
import { getSupabaseBrowser } from "@/lib/storage/browser";

export type UploadPhase =
  | "idle"
  | "converting"
  | "uploading"
  | "saving"
  | "done"
  | "error";

export type UploadSummary = {
  originalBytes: number;
  finalBytes: number;
  width: number;
  height: number;
};

const BUSY_PHASES: readonly UploadPhase[] = [
  "converting",
  "uploading",
  "saving",
];

// Filenames are unique, so browsers can cache them for a year
const CACHE_SECONDS = "31536000";

export function useImageUpload() {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<UploadSummary | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setError("");
    setSummary(null);
  }, []);

  const upload = useCallback(
    async (
      file: File,
      preset: ImagePresetKey,
      altText: string,
    ): Promise<MediaRow | null> => {
      setError("");
      setSummary(null);

      const problem = validateSourceFile(file);

      if (problem) {
        setPhase("error");
        setError(problem);
        return null;
      }

      try {
        setPhase("converting");
        const converted = await convertImage(file, preset);

        if (converted.blob.size > MAX_UPLOAD_BYTES) {
          throw new Error("Even after converting, this image is over 8 MB.");
        }

        setPhase("uploading");
        const ticketResult = await createMediaUpload({
          preset,
          mimeType: converted.type,
          size: converted.blob.size,
        });

        if (!ticketResult.ok) {
          throw new Error(ticketResult.message);
        }

        const { bucket, path, token } = ticketResult.ticket;
        const { error: uploadError } = await getSupabaseBrowser()
          .storage.from(bucket)
          .uploadToSignedUrl(path, token, converted.blob, {
            contentType: converted.type,
            cacheControl: CACHE_SECONDS,
          });

        if (uploadError) {
          throw new Error(
            "The upload failed. Check your connection and try again.",
          );
        }

        setPhase("saving");
        const result = await finalizeMediaUpload({
          path,
          mimeType: converted.type,
          size: converted.blob.size,
          originalSize: file.size,
          width: converted.width,
          height: converted.height,
          originalName: file.name,
          altText,
        });

        if (!result.ok) {
          throw new Error(result.message);
        }

        setSummary({
          originalBytes: file.size,
          finalBytes: converted.blob.size,
          width: converted.width,
          height: converted.height,
        });
        setPhase("done");

        return result.media;
      } catch (uploadFailure) {
        setPhase("error");
        setError(
          uploadFailure instanceof Error
            ? uploadFailure.message
            : "Something went wrong. Please try again.",
        );

        return null;
      }
    },
    [],
  );

  return {
    phase,
    error,
    summary,
    upload,
    reset,
    isBusy: BUSY_PHASES.includes(phase),
  };
}
