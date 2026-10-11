"use client";

import Link from "next/link";
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { ArrowPathIcon, EyeIcon } from "@heroicons/react/20/solid";

import BlogPreviewDialog from "@/components/admin/blogs/BlogPreviewDialog";
import RecommendationsPicker from "@/components/admin/blogs/RecommendationsPicker";
import SectionsEditor, {
  withKeys,
  type KeyedSection,
} from "@/components/admin/blogs/SectionsEditor";
import CoverPicker from "@/components/admin/fields/CoverPicker";
import PublishPanel, {
  type PublishValue,
} from "@/components/admin/fields/PublishPanel";
import TagInput from "@/components/admin/fields/TagInput";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import { initialActionState, type ActionState } from "@/lib/admin/actionState";
import {
  toBlogSections,
  type CoverValue,
  type Option,
  type SectionDraft,
} from "@/lib/admin/editor";
import { getFieldA11y } from "@/lib/admin/forms";
import {
  buttonClass,
  cardClass,
  inputClass,
  selectClass,
  textareaClass,
  titleInputClass,
} from "@/lib/admin/ui";
import type { Blog } from "@/lib/blog/types";
import {
  countSectionWords,
  formatReadTime,
  getReadTimeMinutes,
} from "@/lib/content/text";
import type { ContentStatus } from "@/lib/db/types";
import { slugify } from "@/lib/utils/slugify";
import { BLOG_LIMITS } from "@/lib/validation/blog";

export type BlogEditorInitial = {
  title: string;
  slug: string;
  excerpt: string;
  sections: SectionDraft[];
  cover: CoverValue;
  categoryId: string;
  tags: string[];
  recommendationIds: string[];
  status: ContentStatus;
  publishAt: string;
  featured: boolean;
};

export type PreviewAuthor = {
  name: string;
  bio: string;
  avatarUrl: string | null;
};

const FALLBACK_AUTHOR: PreviewAuthor = {
  name: "The author",
  bio: "",
  avatarUrl: null,
};

interface BlogEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: BlogEditorInitial;
  categories: Option[];
  tagSuggestions: string[];
  blogOptions: Option[];
  isNew: boolean;
  previewAuthor?: PreviewAuthor;
}

function getSaveLabel(status: ContentStatus, wasPublished: boolean): string {
  if (status === "draft") {
    return "Save draft";
  }

  if (status === "scheduled") {
    return "Schedule";
  }

  return wasPublished ? "Update" : "Publish";
}

/* The date picker holds India time, so the preview reads it the same way */
function toPreviewDate(publishAt: string): string {
  const parsed = publishAt ? new Date(`${publishAt}+05:30`) : null;

  return parsed && !Number.isNaN(parsed.getTime())
    ? parsed.toISOString()
    : new Date().toISOString();
}

export default function BlogEditor({
  action,
  initial,
  categories,
  tagSuggestions,
  blogOptions,
  isNew,
  previewAuthor = FALLBACK_AUTHOR,
}: BlogEditorProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [excerpt, setExcerpt] = useState(initial.excerpt);
  const [sections, setSections] = useState<KeyedSection[]>(() =>
    withKeys(initial.sections),
  );
  const [cover, setCover] = useState<CoverValue>(initial.cover);
  const [tags, setTags] = useState(initial.tags);
  const [recommendationIds, setRecommendationIds] = useState(
    initial.recommendationIds,
  );
  const [publish, setPublish] = useState<PublishValue>({
    status: initial.status,
    publishAt: initial.publishAt,
    featured: initial.featured,
  });
  const [isDirty, setIsDirty] = useState(false);
  const [preview, setPreview] = useState<Blog | null>(null);

  const errors = state.fieldErrors ?? {};
  const shownSlug = slugTouched ? slug : slugify(title);
  const wasPublished = !isNew && initial.status === "published";

  const contentJson = useMemo(
    () =>
      JSON.stringify(
        sections.map(({ heading, body, quote }) => ({ heading, body, quote })),
      ),
    [sections],
  );

  const readTimeMinutes = useMemo(
    () => getReadTimeMinutes(countSectionWords(toBlogSections(sections))),
    [sections],
  );

  // Warns before closing the tab with unsaved writing
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function markDirty() {
    setIsDirty(true);
  }

  function withDirty<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setIsDirty(true);
    };
  }

  /*
   * Submitting this way skips React's automatic form reset,
   * so your writing stays on screen after saving.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsDirty(false);
    startTransition(() => formAction(formData));
  }

  /* Builds the post from what's on screen right now, nothing gets saved */
  function openPreview() {
    const form = formRef.current;
    const selectedCategory = form
      ? String(new FormData(form).get("categoryId") ?? "")
      : initial.categoryId;
    const category =
      categories.find((option) => option.id === selectedCategory)?.label ??
      "Uncategorized";

    setPreview({
      id: "preview",
      slug: shownSlug || "preview",
      title: title.trim() || "Untitled blog",
      excerpt: excerpt.trim(),
      category,
      tags,
      image: cover?.url ?? "",
      publishedAt: toPreviewDate(publish.publishAt),
      readTime: formatReadTime(readTimeMinutes),
      author: previewAuthor.name,
      content: toBlogSections(sections),
      authorBio: previewAuthor.bio,
      authorAvatarUrl: previewAuthor.avatarUrl,
    });
  }

  const titleId = `${id}-title`;
  const slugId = `${id}-slug`;
  const excerptId = `${id}-excerpt`;
  const categoryId = `${id}-category`;
  const tagsId = `${id}-tags`;
  const recommendationsId = `${id}-recommendations`;
  const slugHint = isNew
    ? "Used in the link. Follows the title until you edit it."
    : "Changing this breaks old links to the post.";

  return (
    <>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        onChange={markDirty}
        className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
      >
        <div className="min-w-0 flex flex-col gap-6">
          <div className={cardClass}>
            <FormField id={titleId} label="Title" errors={errors.title}>
              <input
                {...getFieldA11y(titleId, errors.title)}
                name="title"
                type="text"
                required
                value={title}
                maxLength={BLOG_LIMITS.title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Building a focused development workflow"
                className={titleInputClass}
              />
            </FormField>

            <FormField
              id={slugId}
              label="Slug"
              hint={slugHint}
              errors={errors.slug}
            >
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
                placeholder="building-a-focused-development-workflow"
                className={inputClass}
              />
            </FormField>

            <FormField
              id={excerptId}
              label="Excerpt"
              hint={`${excerpt.length}/${BLOG_LIMITS.excerpt}. Shows on cards and in search results.`}
              errors={errors.excerpt}
            >
              <textarea
                {...getFieldA11y(excerptId, errors.excerpt, "hint")}
                name="excerpt"
                rows={3}
                value={excerpt}
                maxLength={BLOG_LIMITS.excerpt}
                onChange={(event) => setExcerpt(event.target.value)}
                placeholder="One or two sentences that make people want to read."
                className={textareaClass}
              />
            </FormField>
          </div>

          <SectionsEditor
            sections={sections}
            onChange={withDirty(setSections)}
            readTimeMinutes={readTimeMinutes}
            errors={errors.content}
          />

          <input type="hidden" name="content" value={contentJson} />
        </div>

        <aside className="flex flex-col gap-6">
          <PublishPanel
            id={id}
            value={publish}
            onChange={withDirty(setPublish)}
            errors={errors}
            featuredLabel="Feature on the home page"
          >
            <button
              type="button"
              onClick={openPreview}
              className={buttonClass.secondary}
            >
              <EyeIcon aria-hidden="true" className="w-4 h-4" />
              Preview
            </button>

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
              {isPending
                ? "Saving"
                : getSaveLabel(publish.status, wasPublished)}
            </button>

            <FormStatus state={state} />
          </PublishPanel>

          <div className={cardClass}>
            <CoverPicker
              id={`${id}-cover`}
              name="coverMediaId"
              label="Cover image"
              preset="blogCover"
              value={cover}
              onChange={withDirty(setCover)}
              aspectClass="aspect-16/10"
              hint="Keep the subject near the center, pages crop it differently."
              errors={errors.coverMediaId}
            />
          </div>

          <div className={cardClass}>
            <FormField
              id={categoryId}
              label="Category"
              errors={errors.categoryId}
            >
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
              hint={`Up to ${BLOG_LIMITS.tags}. New ones get created when you save.`}
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

          <div className={cardClass}>
            <p className="text-sm font-medium text-foreground">
              Recommended posts
            </p>

            <RecommendationsPicker
              id={recommendationsId}
              name="recommendations"
              options={blogOptions}
              value={recommendationIds}
              onChange={withDirty(setRecommendationIds)}
              max={BLOG_LIMITS.recommendations}
              errors={errors.recommendations}
            />
          </div>
        </aside>
      </form>

      <BlogPreviewDialog blog={preview} onClose={() => setPreview(null)} />
    </>
  );
}
