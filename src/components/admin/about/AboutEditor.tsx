"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/20/solid";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import SectionsEditor, {
  withKeys,
  type KeyedSection,
} from "@/components/admin/blogs/SectionsEditor";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import SaveButton from "@/components/admin/ui/SaveButton";
import type { ActionState } from "@/lib/admin/actionState";
import { toBlogSections, type SectionDraft } from "@/lib/admin/editor";
import { getFieldA11y } from "@/lib/admin/forms";
import {
  buttonClass,
  cardClass,
  inputClass,
  textareaClass,
} from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import { countSectionWords, getReadTimeMinutes } from "@/lib/content/text";
import { ABOUT_LIMITS } from "@/lib/validation/about";

export type AboutEditorInitial = {
  headline: string;
  intro: string;
  sections: SectionDraft[];
  showLatest: boolean;
};

interface AboutEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: AboutEditorInitial;
}

export default function AboutEditor({ action, initial }: AboutEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();

  const [intro, setIntro] = useState(initial.intro);
  const [sections, setSections] = useState<KeyedSection[]>(() =>
    withKeys(initial.sections),
  );

  const errors = state.fieldErrors ?? {};
  const headlineId = `${id}-headline`;
  const introId = `${id}-intro`;
  const headlineHint =
    "A short line under your name, like Writer, dreamer, collector of small moments.";
  const introHint = `${intro.length}/${ABOUT_LIMITS.intro}. Your opening words, shown large with a drop cap. Leave an empty line between paragraphs.`;

  const sectionsJson = useMemo(
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

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <div className="min-w-0 flex flex-col gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-foreground">Opening</h2>

          <FormField
            id={headlineId}
            label="Headline"
            hint={headlineHint}
            errors={errors.headline}
            optional
          >
            <input
              {...getFieldA11y(headlineId, errors.headline, headlineHint)}
              name="headline"
              type="text"
              maxLength={ABOUT_LIMITS.headline}
              defaultValue={initial.headline}
              autoComplete="off"
              className={inputClass}
            />
          </FormField>

          <FormField
            id={introId}
            label="Intro"
            hint={introHint}
            errors={errors.intro}
            optional
          >
            <textarea
              {...getFieldA11y(introId, errors.intro, introHint)}
              name="intro"
              rows={6}
              value={intro}
              maxLength={ABOUT_LIMITS.intro}
              onChange={(event) => setIntro(event.target.value)}
              placeholder="I write about the small things that make days better, and stories that start with a single drop of ink."
              className={textareaClass}
            />
          </FormField>
        </div>

        <SectionsEditor
          sections={sections}
          onChange={(next) => {
            setSections(next);
            markDirty();
          }}
          readTimeMinutes={readTimeMinutes}
          errors={errors.sections}
        />

        <input type="hidden" name="sections" value={sectionsJson} />
      </div>

      <aside className="flex flex-col gap-6">
        <div className={`${cardClass} *:w-full`}>
          <SaveButton isPending={isPending} label="Save about page" />
          <FormStatus state={state} />

          <Link href="/about" target="_blank" className={buttonClass.secondary}>
            <ArrowTopRightOnSquareIcon aria-hidden="true" className="w-4 h-4" />
            View page
            <span className="sr-only">, opens in a new tab</span>
          </Link>
        </div>

        <div className={cardClass}>
          <label className="flex items-start gap-3 text-sm text-foreground">
            <input
              type="checkbox"
              name="showLatest"
              defaultChecked={initial.showLatest}
              className="w-4 h-4 mt-0.5 shrink-0 accent-accent"
            />

            <span className="flex flex-col gap-0.5">
              <span className="font-medium">Show latest writing</span>
              <span className="text-xs leading-5 text-muted">
                Your newest blogs and stories near the bottom of the page.
              </span>
            </span>
          </label>
        </div>

        <p className="p-4 flex items-start gap-2 text-sm leading-6 text-muted bg-surface-muted border border-border rounded-xl">
          <InformationCircleIcon
            aria-hidden="true"
            className="w-5 h-5 shrink-0 text-accent"
          />
          The painting at the top lives in src/assets, with day, night, and
          phone versions that switch on their own.
        </p>
      </aside>
    </form>
  );
}
