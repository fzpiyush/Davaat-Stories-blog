"use client";

import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { buttonClass } from "@/lib/admin/ui";
import type { ContentStatus } from "@/lib/db/types";

export function getSaveLabel(
  status: ContentStatus,
  wasPublished: boolean,
): string {
  if (status === "draft") {
    return "Save draft";
  }

  if (status === "scheduled") {
    return "Schedule";
  }

  return wasPublished ? "Update" : "Publish";
}

interface SaveButtonProps {
  isPending: boolean;
  label: string;
  pendingLabel?: string;
}

export default function SaveButton({
  isPending,
  label,
  pendingLabel = "Saving",
}: SaveButtonProps) {
  return (
    <button
      type="submit"
      disabled={isPending}
      aria-busy={isPending}
      className={buttonClass.primary}
    >
      {isPending && (
        <ArrowPathIcon
          aria-hidden="true"
          className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
        />
      )}
      {isPending ? pendingLabel : label}
    </button>
  );
}
