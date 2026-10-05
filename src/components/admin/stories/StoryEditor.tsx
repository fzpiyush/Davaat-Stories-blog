"use client";

import Link from "next/link";
import { useId, useState } from "react";

import CoverPicker from "@/components/admin/fields/CoverPicker";
import PublishPanel, { type PublishValue } from "@/components/admin/fields/PublishPanel";
import TagInput from "@/components/admin/fields/TagInput";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import SaveButton, { getSaveLabel } from "@/components/admin/ui/SaveButton";
import type { ActionState } from "@/lib/admin/actionState";
import type { CoverValue, Option } from "@/lib/admin/editor";
import { getFieldA11y } from "@/lib/admin/forms";
import {
  cardClass,
  inputClass,
  selectClass,
  textareaClass,
  titleInputClass,
} from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import { STORY_PROGRESS_OPTIONS } from "@/lib/content/story";
import type { ContentStatus, StoryProgress } from "@/lib/db/types";
import { slugify } from "@/lib/utils/slugify";
import { BLOG_LIMITS } from "@/lib/validation/blog";
import { STORY_LIMITS } from "@/lib/validation/story";

export type StoryEditorInitial = {
  title: string;
  slug: string;
  blurb: string;
  cover: CoverValue;
  categoryId: string;
  tags: string[];
  progress: StoryProgress;
  status: ContentStatus;
  publishAt: string;
  featured: boolean;
};

interface StoryEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: StoryEditorInitial;
  categories: Option[];
  tagSuggestions: string[];
  isNew: boolean;
}

export default function StoryEditor({
  action,
  initial,
  categories,
  tagSuggestions,
  isNew,
}: StoryEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [blurb, setBlurb] = useState(initial.blurb);
  const [cover, setCover] = useState<CoverValue>(initial.cover);
  const [tags, setTags] = useState(initial.tags);
  const [publish, setPublish] = useState<PublishValue>({
    status: initial.status,
    publishAt: initial.publishAt,
    featured: initial.featured,
  });

  const errors = state.fieldErrors ?? {};
  const shownSlug = slugTouched ? slug : slugify(title);
  const wasPublished = !isNew && initial.status === "published";

  function withDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      markDirty();
    };
  }

  const titleId = `${id}-title`;
  const slugId = `${id}-slug`;
  const blurbId = `${id}-blurb`;
  const progressId = `${id}-progress`;
  const categoryId = `${id}-category`;
  const tagsId = `${id}-tags`;
  const slugHint = isNew
    ? "Used in the link. Follows the title until you edit it."
    : "Changing this breaks old links to the story.";
  const blurbHint = `${blurb.length}/${STORY_LIMITS.blurb}. The hook readers see on cards and the story page.`;

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <div className={`min-w-0 ${cardClass}`}>
        <FormField id={titleId} label="Title" errors={errors.title}>
          <input
            {...getFieldA11y(titleId, errors.title)}
            name="title"
            type="text"
            required
            value={title}
            maxLength={STORY_LIMITS.title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The lantern keeper of the northern pass"
            className={titleInputClass}
          />
        </FormField>

        <FormField id={slugId} label="Slug" hint={slugHint} errors={errors.slug}>
          <input
            {...getFieldA11y(slugId, errors.slug, slugHint)}
            name="slug"
            type="text"
            value={shownSlug}
            maxLength={120}
            autoComplete="off"
            onChange={(event) => {
              setSlug(event.target.value);
              setSlugTouched(true);
            }}
            placeholder="the-lantern-keeper"
            className={inputClass}
          />
        </FormField>

        <FormField id={blurbId} label="Blurb" hint={blurbHint} errors={errors.blurb}>
          <textarea
            {...getFieldA11y(blurbId, errors.blurb, blurbHint)}
            name="blurb"
            rows={6}
            value={blurb}
            maxLength={STORY_LIMITS.blurb}
            onChange={(event) => setBlurb(event.target.value)}
            placeholder="A few lines that make someone want to start chapter one."
            className={textareaClass}
          />
        </FormField>

        <FormField id={progressId} label="Story progress" errors={errors.progress}>
          <select
            {...getFieldA11y(progressId, errors.progress)}
            name="progress"
            defaultValue={initial.progress}
            className={selectClass}
          >
            {STORY_PROGRESS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <aside className="flex flex-col gap-6">
        <PublishPanel
          id={id}
          value={publish}
          onChange={setPublish}
          errors={errors}
          featuredLabel="Feature on the home page"
        >
          <SaveButton
            isPending={isPending}
            label={getSaveLabel(publish.status, wasPublished)}
          />
          <FormStatus state={state} />
        </PublishPanel>

        <div className={cardClass}>
          <CoverPicker
            id={`${id}-cover`}
            name="coverMediaId"
            label="Cover"
            preset="storyCover"
            value={cover}
            onChange={withDirty(setCover)}
            aspectClass="aspect-3/4"
            hint="Portrait 3:4. Other shapes get cropped from the center."
            errors={errors.coverMediaId}
          />
        </div>

        <div className={cardClass}>
          <FormField id={categoryId} label="Category" errors={errors.categoryId}>
            <select
              {...getFieldA11y(categoryId, errors.categoryId)}
              name="categoryId"
              defaultValue={initial.categoryId}
              className={selectClass}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </FormField>

          <Link
            href="/admin/categories"
            className="w-fit text-xs text-muted underline underline-offset-4 rounded-sm transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Manage categories
          </Link>
        </div>

        <div className={cardClass}>
          <FormField
            id={tagsId}
            label="Tags"
            hint={`Up to ${BLOG_LIMITS.tags}. Genres work great here, like Fantasy or Slow burn.`}
            errors={errors.tags}
          >
            <TagInput
              id={tagsId}
              name="tags"
              value={tags}
              onChange={withDirty(setTags)}
              suggestions={tagSuggestions}
              max={BLOG_LIMITS.tags}
              maxLength={BLOG_LIMITS.tagName}
              hint="hint"
              errors={errors.tags}
            />
          </FormField>
        </div>
      </aside>
    </form>
  );
}