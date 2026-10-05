"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowPathIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import { PhotoIcon } from "@heroicons/react/24/outline";

import { formatBytes } from "@/lib/admin/format";
import {
  buttonClass,
  cardClass,
  inputClass,
  selectClass,
} from "@/lib/admin/ui";
import type { MediaRow } from "@/lib/db/types";
import { validateSourceFile } from "@/lib/media/convert";
import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_PRESETS,
  type ImagePresetKey,
} from "@/lib/media/presets";
import { useImageUpload, type UploadPhase } from "@/lib/media/useImageUpload";

type Selection = {
  file: File;
  previewUrl: string;
};

const PRESET_KEYS = Object.keys(IMAGE_PRESETS) as ImagePresetKey[];
const ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");

const PHASE_LABEL: Partial<Record<UploadPhase, string>> = {
  converting: "Converting to WebP",
  uploading: "Uploading",
  saving: "Saving to your library",
};

function describePreset(key: ImagePresetKey): string {
  const preset = IMAGE_PRESETS[key];
  const shape =
    preset.aspectRatio === null
      ? "original shape kept"
      : preset.aspectRatio === 1
        ? "cropped to a square"
        : "cropped to 3:4 portrait";

  return `Up to ${preset.maxWidth} × ${preset.maxHeight}, ${shape}.`;
}

interface ImageUploaderProps {
  /** Locks the preset and hides the choice, used by pickers */
  preset?: ImagePresetKey;
  refreshAfterUpload?: boolean;
  onUploaded?: (media: MediaRow) => void;
}

export default function ImageUploader({
  preset: fixedPreset,
  refreshAfterUpload = false,
  onUploaded,
}: ImageUploaderProps) {
  const router = useRouter();
  const id = useId();
  const previewRef = useRef<string | null>(null);

  const [preset, setPreset] = useState<ImagePresetKey>(
    fixedPreset ?? "blogCover",
  );
  const [selection, setSelection] = useState<Selection | null>(null);
  const [altText, setAltText] = useState("");
  const [selectError, setSelectError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const { phase, error, summary, upload, reset, isBusy } = useImageUpload();

  const headingId = `${id}-heading`;
  const fileId = `${id}-file`;
  const altId = `${id}-alt`;
  const presetId = `${id}-preset`;
  const displayError = selectError || error;

  // Frees the preview from memory when the uploader goes away
  useEffect(
    () => () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    },
    [],
  );

  function replaceSelection(next: Selection | null) {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }

    previewRef.current = next?.previewUrl ?? null;
    setSelection(next);
  }

  function selectFile(file: File | undefined) {
    reset();

    if (!file) {
      return;
    }

    const problem = validateSourceFile(file);

    if (problem) {
      replaceSelection(null);
      setSelectError(problem);
      return;
    }

    setSelectError("");
    replaceSelection({ file, previewUrl: URL.createObjectURL(file) });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    // Lets the same file be picked again after clearing
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);

    if (!isBusy) {
      selectFile(event.dataTransfer.files[0]);
    }
  }

  function handleClear() {
    replaceSelection(null);
    setSelectError("");
    reset();
  }

  async function handleUpload() {
    if (!selection || isBusy) {
      return;
    }

    const media = await upload(selection.file, preset, altText);

    if (!media) {
      return;
    }

    replaceSelection(null);
    setAltText("");
    onUploaded?.(media);

    if (refreshAfterUpload) {
      router.refresh();
    }
  }

  const savedPercent =
    summary && summary.finalBytes < summary.originalBytes
      ? Math.round((1 - summary.finalBytes / summary.originalBytes) * 100)
      : null;

  return (
    <section aria-labelledby={headingId} className={cardClass}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 id={headingId} className="text-lg font-semibold text-foreground">
            Upload an image
          </h2>

          <p className="text-sm leading-6 text-muted">
            Converted to WebP on your computer. {describePreset(preset)}
          </p>
        </div>

        {!fixedPreset && (
          <div className="w-full sm:w-52 flex shrink-0 flex-col gap-2">
            <label
              htmlFor={presetId}
              className="text-sm font-medium text-foreground"
            >
              Use for
            </label>

            <select
              id={presetId}
              value={preset}
              disabled={isBusy}
              onChange={(event) =>
                setPreset(event.target.value as ImagePresetKey)
              }
              className={selectClass}
            >
              {PRESET_KEYS.map((key) => (
                <option key={key} value={key}>
                  {IMAGE_PRESETS[key].label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <label
        htmlFor={fileId}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="w-full min-h-48 p-6 flex flex-col items-center justify-center gap-3 text-center bg-background border-2 border-dashed border-border rounded-lg cursor-pointer transition-colors hover:bg-surface-muted data-dragging:bg-surface-muted data-dragging:border-accent has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-accent"
      >
        <input
          id={fileId}
          type="file"
          accept={ACCEPT}
          disabled={isBusy}
          onChange={handleFileChange}
          className="sr-only"
        />

        {selection ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selection.previewUrl}
              alt=""
              className="w-auto max-h-56 object-contain rounded-md"
            />

            <span className="text-sm text-muted">
              {selection.file.name} • {formatBytes(selection.file.size)}. Click
              to pick another.
            </span>
          </>
        ) : (
          <>
            <PhotoIcon aria-hidden="true" className="w-10 h-10 text-accent" />

            <span className="text-sm font-medium text-foreground">
              Drop an image here or{" "}
              <span className="text-accent underline underline-offset-4">
                browse
              </span>
            </span>

            <span className="text-xs text-muted">
              JPG, PNG, WebP, or AVIF up to 20 MB
            </span>
          </>
        )}
      </label>

      <div className="flex flex-col gap-2">
        <label
          htmlFor={altId}
          className="flex items-center gap-2 text-sm font-medium text-foreground"
        >
          Alt text
          <span className="text-xs font-normal text-muted">
            Helps screen readers and search engines
          </span>
        </label>

        <input
          id={altId}
          type="text"
          value={altText}
          maxLength={300}
          disabled={isBusy}
          onChange={(event) => setAltText(event.target.value)}
          placeholder="A quiet lake at sunrise with mountains behind"
          className={inputClass}
        />
      </div>

      <div aria-live="polite" className="min-h-5">
        {isBusy && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <ArrowPathIcon
              aria-hidden="true"
              className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
            />
            {PHASE_LABEL[phase]}
          </p>
        )}

        {displayError && (
          <p
            role="alert"
            className="flex items-start gap-2 text-sm text-red-600"
          >
            <ExclamationCircleIcon
              aria-hidden="true"
              className="w-4 h-4 mt-0.5 shrink-0"
            />
            {displayError}
          </p>
        )}

        {phase === "done" && summary && (
          <p className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircleIcon
              aria-hidden="true"
              className="w-4 h-4 mt-0.5 shrink-0 text-accent"
            />
            {savedPercent !== null
              ? `Uploaded. ${formatBytes(summary.originalBytes)} became ${formatBytes(summary.finalBytes)}, ${savedPercent}% smaller, at ${summary.width} × ${summary.height}.`
              : `Uploaded at ${summary.width} × ${summary.height}.`}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selection || isBusy}
          aria-busy={isBusy}
          className={buttonClass.primary}
        >
          <ArrowUpTrayIcon aria-hidden="true" className="w-4 h-4 shrink-0" />
          {isBusy ? "Working" : "Upload"}
        </button>

        {selection && !isBusy && (
          <button
            type="button"
            onClick={handleClear}
            className={buttonClass.secondary}
          >
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
