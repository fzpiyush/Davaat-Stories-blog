"use client";

import Image from "next/image";
import { useId, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationCircleIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import MediaPickerDialog from "@/components/admin/media/MediaPickerDialog";
import { pluralize } from "@/lib/admin/format";
import {
  EMPTY_SECTION,
  type SectionDraft,
  type SectionImageValue,
} from "@/lib/admin/editor";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  inputClass,
  smallButtonClass,
  textareaClass,
} from "@/lib/admin/ui";
import { countWords } from "@/lib/content/text";
import { BLOG_LIMITS } from "@/lib/validation/blog";

export type KeyedSection = SectionDraft & { key: string };

type TextField = "heading" | "body" | "quote" | "caption";

const BODY_HINT = "Leave an empty line between paragraphs.";

function createKey(): string {
  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function withKeys(drafts: SectionDraft[]): KeyedSection[] {
  return drafts.map((draft, index) => ({ ...draft, key: `section-${index}` }));
}

interface SectionsEditorProps {
  sections: KeyedSection[];
  onChange: (next: KeyedSection[]) => void;
  wordCount: number;
  readTimeMinutes: number;
  errors?: string[];
  /** Shows an image picker in every section */
  allowImages?: boolean;
}

export default function SectionsEditor({
  sections,
  onChange,
  wordCount,
  readTimeMinutes,
  errors,
  allowImages = false,
}: SectionsEditorProps) {
  const baseId = useId();
  const headingId = `${baseId}-heading`;
  const error = errors?.[0];

  // The section waiting for an image, by key so reordering can't mix them up
  const [pickingKey, setPickingKey] = useState<string | null>(null);

  function update(index: number, field: TextField, text: string) {
    onChange(
      sections.map((section, position) =>
        position === index ? { ...section, [field]: text } : section,
      ),
    );
  }

  function setImage(key: string, image: SectionImageValue | null) {
    onChange(
      sections.map((section) =>
        section.key === key
          ? { ...section, image, caption: image ? section.caption : "" }
          : section,
      ),
    );
  }

  function add() {
    onChange([...sections, { ...EMPTY_SECTION, key: createKey() }]);
  }

  function remove(index: number) {
    const section = sections[index];
    const hasContent = Boolean(
      section.heading || section.body || section.quote || section.image,
    );

    if (hasContent && !window.confirm(`Remove section ${index + 1}?`)) {
      return;
    }

    const next = sections.filter((_, position) => position !== index);
    onChange(next.length > 0 ? next : [{ ...EMPTY_SECTION, key: createKey() }]);
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= sections.length) {
      return;
    }

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <section aria-labelledby={headingId} className={cardClass}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 id={headingId} className="text-lg font-semibold text-foreground">
          Content
        </h2>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <span>{pluralize(sections.length, "section")}</span>
          <span aria-hidden="true">•</span>
          <span>{pluralize(wordCount, "word")}</span>
          <span aria-hidden="true">•</span>
          <span>About {readTimeMinutes} min read</span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-sm text-red-600"
        >
          <ExclamationCircleIcon
            aria-hidden="true"
            className="w-4 h-4 mt-0.5 shrink-0"
          />
          {error}
        </p>
      )}

      <ol className="flex flex-col gap-4">
        {sections.map((section, index) => {
          const fieldId = `${baseId}-${section.key}`;
          const number = index + 1;

          return (
            <li
              key={section.key}
              className="p-4 sm:p-5 flex flex-col gap-4 bg-background border border-border rounded-lg"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
                  Section {number}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label={`Move section ${number} up`}
                    className={iconButtonClass}
                  >
                    <ArrowUpIcon aria-hidden="true" className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === sections.length - 1}
                    aria-label={`Move section ${number} down`}
                    className={iconButtonClass}
                  >
                    <ArrowDownIcon aria-hidden="true" className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label={`Remove section ${number}`}
                    className={iconButtonClass}
                  >
                    <TrashIcon aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${fieldId}-heading`}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  Heading
                  <span className="text-xs font-normal text-muted">
                    Optional, shows in the table of contents
                  </span>
                </label>

                <input
                  id={`${fieldId}-heading`}
                  type="text"
                  value={section.heading}
                  maxLength={BLOG_LIMITS.heading}
                  onChange={(event) =>
                    update(index, "heading", event.target.value)
                  }
                  placeholder="Why a focused workflow matters"
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${fieldId}-body`}
                  className="text-sm font-medium text-foreground"
                >
                  Paragraphs
                </label>

                <textarea
                  id={`${fieldId}-body`}
                  value={section.body}
                  rows={8}
                  maxLength={BLOG_LIMITS.body}
                  aria-describedby={`${fieldId}-body-hint`}
                  onChange={(event) =>
                    update(index, "body", event.target.value)
                  }
                  placeholder="Start writing here."
                  className={textareaClass}
                />

                <p
                  id={`${fieldId}-body-hint`}
                  className="text-xs leading-5 text-muted"
                >
                  {BODY_HINT} {pluralize(countWords(section.body), "word")} in
                  these paragraphs.
                </p>
              </div>

              {allowImages && (
                <div className="flex flex-col gap-3">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    Image
                    <span className="text-xs font-normal text-muted">
                      Optional, shows below the paragraphs
                    </span>
                  </p>

                  {section.image && (
                    <div className="w-full max-w-sm aspect-16/10 bg-surface-muted rounded-lg relative overflow-hidden ring-1 ring-border">
                      <Image
                        src={section.image.url}
                        alt={section.image.alt}
                        fill
                        sizes="384px"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPickingKey(section.key)}
                      className={smallButtonClass.secondary}
                    >
                      <PhotoIcon aria-hidden="true" className="w-4 h-4" />
                      {section.image ? "Change image" : "Add image"}
                    </button>

                    {section.image && (
                      <button
                        type="button"
                        onClick={() => setImage(section.key, null)}
                        className={smallButtonClass.danger}
                      >
                        Remove image
                      </button>
                    )}
                  </div>

                  {section.image && (
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor={`${fieldId}-caption`}
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        Caption
                        <span className="text-xs font-normal text-muted">
                          Optional
                        </span>
                      </label>

                      <input
                        id={`${fieldId}-caption`}
                        type="text"
                        value={section.caption ?? ""}
                        maxLength={BLOG_LIMITS.caption}
                        onChange={(event) =>
                          update(index, "caption", event.target.value)
                        }
                        placeholder="A short line about the image"
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${fieldId}-quote`}
                  className="flex items-center gap-2 text-sm font-medium text-foreground"
                >
                  Quote
                  <span className="text-xs font-normal text-muted">
                    Optional
                  </span>
                </label>

                <input
                  id={`${fieldId}-quote`}
                  type="text"
                  value={section.quote}
                  maxLength={BLOG_LIMITS.quote}
                  onChange={(event) =>
                    update(index, "quote", event.target.value)
                  }
                  placeholder="A line worth highlighting"
                  className={inputClass}
                />
              </div>
            </li>
          );
        })}
      </ol>

      <div>
        <button
          type="button"
          onClick={add}
          disabled={sections.length >= BLOG_LIMITS.sections}
          className={buttonClass.secondary}
        >
          <PlusIcon aria-hidden="true" className="w-4 h-4" />
          Add section
        </button>
      </div>

      {pickingKey && (
        <MediaPickerDialog
          title="Section image"
          preset="blogCover"
          onSelect={(picked) => {
            setImage(pickingKey, picked);
            setPickingKey(null);
          }}
          onClose={() => setPickingKey(null)}
        />
      )}
    </section>
  );
}
