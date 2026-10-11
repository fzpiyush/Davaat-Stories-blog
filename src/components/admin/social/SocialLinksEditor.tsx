"use client";

import { useId, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ExclamationCircleIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";

import FormStatus from "@/components/admin/ui/FormStatus";
import SaveButton from "@/components/admin/ui/SaveButton";
import type { ActionState } from "@/lib/admin/actionState";
import { getFieldA11y } from "@/lib/admin/forms";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  inputClass,
  selectClass,
} from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import type { SocialPlatform } from "@/lib/db/types";
import {
  MAX_SOCIAL_LINKS,
  SOCIAL_PLATFORM_LABEL,
  SOCIAL_PLATFORM_PLACEHOLDER,
  SOCIAL_PLATFORMS,
} from "@/lib/social/platforms";

export type SocialLinkDraft = {
  platform: SocialPlatform;
  url: string;
};

type KeyedLink = SocialLinkDraft & { key: string };

function createKey(): string {
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/* Suggests the first platform you haven't added yet */
function pickNextPlatform(links: KeyedLink[]): SocialPlatform {
  const used = new Set(links.map((link) => link.platform));
  return SOCIAL_PLATFORMS.find((platform) => !used.has(platform)) ?? "website";
}

interface SocialLinksEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: SocialLinkDraft[];
}

export default function SocialLinksEditor({
  action,
  initial,
}: SocialLinksEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();
  const headingId = `${id}-heading`;

  const [links, setLinks] = useState<KeyedLink[]>(() =>
    initial.map((link, index) => ({ ...link, key: `link-${index}` })),
  );

  const errors = state.fieldErrors ?? {};
  const listError = errors.links?.[0];
  const isFull = links.length >= MAX_SOCIAL_LINKS;

  function change(next: KeyedLink[]) {
    setLinks(next);
    markDirty();
  }

  function update(index: number, patch: Partial<SocialLinkDraft>) {
    change(
      links.map((link, position) =>
        position === index ? { ...link, ...patch } : link,
      ),
    );
  }

  function add() {
    if (isFull) {
      return;
    }

    change([
      ...links,
      { key: createKey(), platform: pickNextPlatform(links), url: "" },
    ]);
  }

  function remove(index: number) {
    change(links.filter((_, position) => position !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;

    if (target < 0 || target >= links.length) {
      return;
    }

    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    change(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <section aria-labelledby={headingId} className={`min-w-0 ${cardClass}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 id={headingId} className="text-lg font-semibold text-foreground">
            Your links
          </h2>

          <p className="text-sm text-muted">
            {links.length} of {MAX_SOCIAL_LINKS}
          </p>
        </div>

        {listError && (
          <p
            role="alert"
            className="flex items-start gap-1.5 text-sm text-red-600"
          >
            <ExclamationCircleIcon
              aria-hidden="true"
              className="w-4 h-4 mt-0.5 shrink-0"
            />
            {listError}
          </p>
        )}

        {links.length === 0 ? (
          <p className="p-4 text-sm text-muted bg-background border border-dashed border-border rounded-lg">
            No links yet. Add your first one below.
          </p>
        ) : (
          <ol className="flex flex-col gap-3">
            {links.map((link, index) => {
              const number = index + 1;
              const label = SOCIAL_PLATFORM_LABEL[link.platform];
              const rowId = `${id}-${link.key}`;
              const urlId = `${rowId}-url`;
              const urlErrors = errors[`url.${index}`];
              const rowError =
                urlErrors?.[0] ?? errors[`platform.${index}`]?.[0];

              return (
                <li
                  key={link.key}
                  className="p-3 sm:p-4 flex flex-col gap-2 bg-background border border-border rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <label htmlFor={`${rowId}-platform`} className="sr-only">
                      Platform for link {number}
                    </label>

                    <select
                      id={`${rowId}-platform`}
                      name="platform"
                      value={link.platform}
                      onChange={(event) =>
                        update(index, {
                          platform: event.target.value as SocialPlatform,
                        })
                      }
                      className={`${selectClass} sm:w-44 sm:shrink-0`}
                    >
                      {SOCIAL_PLATFORMS.map((platform) => (
                        <option key={platform} value={platform}>
                          {SOCIAL_PLATFORM_LABEL[platform]}
                        </option>
                      ))}
                    </select>

                    <label htmlFor={urlId} className="sr-only">
                      {label} link
                    </label>

                    <input
                      {...getFieldA11y(urlId, urlErrors)}
                      name="url"
                      type="url"
                      inputMode="url"
                      maxLength={500}
                      value={link.url}
                      onChange={(event) =>
                        update(index, { url: event.target.value })
                      }
                      placeholder={SOCIAL_PLATFORM_PLACEHOLDER[link.platform]}
                      className={inputClass}
                    />

                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => move(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${label} up`}
                        className={iconButtonClass}
                      >
                        <ArrowUpIcon aria-hidden="true" className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => move(index, 1)}
                        disabled={index === links.length - 1}
                        aria-label={`Move ${label} down`}
                        className={iconButtonClass}
                      >
                        <ArrowDownIcon aria-hidden="true" className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(index)}
                        aria-label={`Remove ${label}`}
                        className={iconButtonClass}
                      >
                        <TrashIcon aria-hidden="true" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {rowError && (
                    <p
                      id={`${urlId}-error`}
                      role="alert"
                      className="text-sm text-red-600"
                    >
                      {rowError}
                    </p>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        <div>
          <button
            type="button"
            onClick={add}
            disabled={isFull}
            className={buttonClass.secondary}
          >
            <PlusIcon aria-hidden="true" className="w-4 h-4" />
            Add link
          </button>
        </div>
      </section>

      <aside className="flex flex-col gap-6">
        <div className={`${cardClass} *:w-full`}>
          <p className="text-sm leading-6 text-muted">
            These show in your site footer and on your About page, in this
            order.
          </p>

          <SaveButton isPending={isPending} label="Save links" />
          <FormStatus state={state} />
        </div>
      </aside>
    </form>
  );
}
