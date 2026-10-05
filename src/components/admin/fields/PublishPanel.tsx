"use client";

import type { ReactNode } from "react";

import FormField from "@/components/admin/ui/FormField";
import type { FieldErrors } from "@/lib/admin/actionState";
import { getFieldA11y } from "@/lib/admin/forms";
import { cardClass, inputClass } from "@/lib/admin/ui";
import type { ContentStatus } from "@/lib/db/types";

export type PublishValue = {
  status: ContentStatus;
  publishAt: string;
  featured: boolean;
};

const STATUS_OPTIONS: {
  value: ContentStatus;
  label: string;
  description: string;
}[] = [
  {
    value: "draft",
    label: "Draft",
    description: "Private. Only you can see it.",
  },
  {
    value: "published",
    label: "Published",
    description: "Live now. Set an earlier date to backdate it.",
  },
  {
    value: "scheduled",
    label: "Scheduled",
    description: "Goes live by itself at the time you pick.",
  },
];

const DATE_HINT = "India time (IST).";

interface PublishPanelProps {
  id: string;
  value: PublishValue;
  onChange: (next: PublishValue) => void;
  errors: FieldErrors;
  /** Shows the featured checkbox when set */
  featuredLabel?: string;
  children: ReactNode;
}

export default function PublishPanel({
  id,
  value,
  onChange,
  errors,
  featuredLabel,
  children,
}: PublishPanelProps) {
  const dateId = `${id}-publish-at`;
  const featuredId = `${id}-featured`;
  const showDate = value.status !== "draft";

  return (
    <div className={cardClass}>
      <fieldset className="flex flex-col gap-3">
        <legend className="pb-3 text-lg font-semibold text-foreground">
          Publishing
        </legend>

        {STATUS_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="p-3 flex items-start gap-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-surface-muted has-checked:bg-surface-muted has-checked:border-accent has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-accent"
          >
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={value.status === option.value}
              onChange={() => onChange({ ...value, status: option.value })}
              className="w-4 h-4 mt-0.5 shrink-0 accent-accent"
            />

            <span className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {option.label}
              </span>
              <span className="text-xs leading-5 text-muted">
                {option.description}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      {showDate && (
        <FormField
          id={dateId}
          label={value.status === "scheduled" ? "Goes live on" : "Publish date"}
          hint={
            value.status === "published"
              ? `Leave empty for right now. ${DATE_HINT}`
              : DATE_HINT
          }
          errors={errors.publishAt}
        >
          <input
            {...getFieldA11y(dateId, errors.publishAt, DATE_HINT)}
            name="publishAt"
            type="datetime-local"
            value={value.publishAt}
            onChange={(event) =>
              onChange({ ...value, publishAt: event.target.value })
            }
            className={inputClass}
          />
        </FormField>
      )}

      {featuredLabel && (
        <label
          htmlFor={featuredId}
          className="flex items-start gap-3 text-sm text-foreground cursor-pointer"
        >
          <input
            id={featuredId}
            name="featured"
            type="checkbox"
            checked={value.featured}
            onChange={(event) =>
              onChange({ ...value, featured: event.target.checked })
            }
            className="w-4 h-4 mt-0.5 shrink-0 accent-accent"
          />

          <span className="flex flex-col gap-0.5">
            <span className="font-medium">{featuredLabel}</span>
            <span className="text-xs leading-5 text-muted">
              Replaces whatever is featured right now.
            </span>
          </span>
        </label>
      )}

      <div className="pt-1 flex flex-col gap-3 *:w-full">{children}</div>
    </div>
  );
}
