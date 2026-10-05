"use client";

import { useId, useMemo, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";

import PublishPanel, {
  type PublishValue,
} from "@/components/admin/fields/PublishPanel";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import SaveButton, { getSaveLabel } from "@/components/admin/ui/SaveButton";
import type { ActionState } from "@/lib/admin/actionState";
import { pluralize } from "@/lib/admin/format";
import { getFieldA11y } from "@/lib/admin/forms";
import { cardClass, titleInputClass } from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import {
  countWords,
  getReadTimeMinutes,
  splitParagraphs,
} from "@/lib/content/text";
import type { ContentStatus } from "@/lib/db/types";
import { STORY_LIMITS } from "@/lib/validation/story";

export type ChapterEditorInitial = {
  title: string;
  content: string;
  status: ContentStatus;
  publishAt: string;
};

const chapterTextClass =
  "w-full min-w-0 min-h-[60vh] px-5 py-4 font-serif text-base leading-8 text-foreground bg-background rounded-lg ring-1 ring-border outline-none resize-y placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600";

interface ChapterEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: ChapterEditorInitial;
  chapterNumber: number;
  isNew: boolean;
  storyIsLive: boolean;
}

export default function ChapterEditor({
  action,
  initial,
  chapterNumber,
  isNew,
  storyIsLive,
}: ChapterEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();

  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [publish, setPublish] = useState<PublishValue>({
    status: initial.status,
    publishAt: initial.publishAt,
    featured: false,
  });

  const stats = useMemo(() => {
    const words = countWords(content);

    return {
      words,
      paragraphs: splitParagraphs(content).length,
      minutes: getReadTimeMinutes(words),
    };
  }, [content]);

  const errors = state.fieldErrors ?? {};
  const wasPublished = !isNew && initial.status === "published";
  const titleId = `${id}-title`;
  const contentId = `${id}-content`;
  const contentHint = `Leave an empty line between paragraphs. ${pluralize(stats.words, "word")}, ${pluralize(stats.paragraphs, "paragraph")}, about ${stats.minutes} min read.`;

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <div className={`min-w-0 ${cardClass}`}>
        <FormField
          id={titleId}
          label={`Chapter ${chapterNumber} title`}
          errors={errors.title}
        >
          <input
            {...getFieldA11y(titleId, errors.title)}
            name="title"
            type="text"
            required
            value={title}
            maxLength={STORY_LIMITS.chapterTitle}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="The night the lanterns went out"
            className={titleInputClass}
          />
        </FormField>

        <FormField
          id={contentId}
          label="Chapter text"
          hint={contentHint}
          errors={errors.content}
        >
          <textarea
            {...getFieldA11y(contentId, errors.content, contentHint)}
            name="content"
            value={content}
            maxLength={STORY_LIMITS.chapterBody}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Start the chapter here."
            className={chapterTextClass}
          />
        </FormField>
      </div>

      <aside className="flex flex-col gap-6 xl:sticky xl:top-24">
        <PublishPanel
          id={id}
          value={publish}
          onChange={setPublish}
          errors={errors}
        >
          <SaveButton
            isPending={isPending}
            label={getSaveLabel(publish.status, wasPublished)}
          />
          <FormStatus state={state} />
        </PublishPanel>

        {!storyIsLive && (
          <p className="p-4 flex items-start gap-2 text-sm leading-6 text-muted bg-surface-muted border border-border rounded-xl">
            <InformationCircleIcon
              aria-hidden="true"
              className="w-5 h-5 shrink-0 text-accent"
            />
            The story itself isn&apos;t live yet, so readers won&apos;t see this
            chapter until the story is published too.
          </p>
        )}
      </aside>
    </form>
  );
}
