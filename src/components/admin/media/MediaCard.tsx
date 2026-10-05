"use client";

import Image from "next/image";
import { useActionState, useId, useState } from "react";
import { CheckIcon, LinkIcon } from "@heroicons/react/20/solid";

import ConfirmActionButton from "@/components/admin/ui/ConfirmActionButton";
import { initialActionState, type ActionState } from "@/lib/admin/actionState";
import { formatAdminDate, formatBytes, pluralize } from "@/lib/admin/format";
import { getFieldA11y } from "@/lib/admin/forms";
import { buttonClass, inputClass, smallButtonClass } from "@/lib/admin/ui";
import type { MediaWithUsage } from "@/lib/db/media";

type FormAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

interface MediaCardProps {
  media: MediaWithUsage;
  altAction: FormAction;
  deleteAction: FormAction;
}

const COPIED_RESET_MS = 2000;

export default function MediaCard({
  media,
  altAction,
  deleteAction,
}: MediaCardProps) {
  const [state, formAction, isPending] = useActionState(
    altAction,
    initialActionState,
  );
  const [copied, setCopied] = useState(false);
  const id = useId();

  const altId = `${id}-alt`;
  const altErrors = state.fieldErrors?.altText;
  const altValue = state.values?.altText ?? media.alt_text;
  const isUsed = media.usage_count > 0;

  const details = [
    media.width && media.height ? `${media.width} × ${media.height}` : null,
    media.size_bytes ? formatBytes(media.size_bytes) : null,
    formatAdminDate(media.created_at),
  ]
    .filter(Boolean)
    .join(" • ");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_RESET_MS);
    } catch {
      // clipboard blocked, nothing else to do
    }
  }

  return (
    <li className="flex">
      <article className="w-full flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
        <div className="w-full aspect-4/3 bg-surface-muted relative">
          <Image
            src={media.url}
            alt={media.alt_text}
            fill
            sizes="(min-width: 1536px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain"
          />

          <span
            className={`px-2.5 py-1 text-xs font-medium rounded-full absolute top-3 left-3 ${
              isUsed
                ? "text-accent-foreground bg-accent"
                : "text-muted bg-background/90"
            }`}
          >
            {isUsed
              ? `Used in ${pluralize(media.usage_count, "place")}`
              : "Not used"}
          </span>
        </div>

        <div className="p-4 flex flex-1 flex-col gap-4">
          <div className="min-w-0 flex flex-col gap-1">
            <p
              title={media.original_name ?? undefined}
              className="truncate text-sm font-medium text-foreground"
            >
              {media.original_name ?? "External image"}
            </p>

            <p className="text-xs text-muted">{details}</p>
          </div>

          <form action={formAction} className="flex flex-col gap-2">
            <label
              htmlFor={altId}
              className="text-xs font-medium text-foreground"
            >
              Alt text
            </label>

            <div className="flex gap-2">
              <input
                {...getFieldA11y(altId, altErrors)}
                name="altText"
                type="text"
                maxLength={300}
                defaultValue={altValue}
                placeholder="Describe the image"
                className={inputClass}
              />

              <button
                type="submit"
                disabled={isPending}
                aria-busy={isPending}
                className={buttonClass.secondary}
              >
                {isPending ? "Saving" : "Save"}
              </button>
            </div>

            {altErrors ? (
              <p id={`${altId}-error`} className="text-xs text-red-600">
                {altErrors[0]}
              </p>
            ) : state.status === "error" ? (
              <p role="alert" className="text-xs text-red-600">
                {state.message}
              </p>
            ) : (
              state.status === "success" && (
                <p role="status" className="text-xs text-muted">
                  {state.message}
                </p>
              )
            )}
          </form>

          <div className="mt-auto pt-4 flex items-start justify-between gap-2 border-t border-border">
            <button
              type="button"
              onClick={copyLink}
              className={smallButtonClass.secondary}
            >
              {copied ? (
                <CheckIcon aria-hidden="true" className="w-4 h-4 text-accent" />
              ) : (
                <LinkIcon aria-hidden="true" className="w-4 h-4" />
              )}
              {copied ? "Copied" : "Copy link"}
            </button>

            <ConfirmActionButton
              action={deleteAction}
              label="Delete"
              pendingLabel="Deleting"
              confirmMessage="Delete this image? This can't be undone."
              size="small"
              disabledReason={
                isUsed ? "Swap this image out where it's used first" : undefined
              }
            />
          </div>
        </div>
      </article>
    </li>
  );
}
