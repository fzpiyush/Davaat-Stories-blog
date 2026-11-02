"use client";

import { useId, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

import PublishPanel, {
  type PublishValue,
} from "@/components/admin/fields/PublishPanel";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import type { ActionState } from "@/lib/admin/actionState";
import { getFieldA11y } from "@/lib/admin/forms";
import {
  buttonClass,
  cardClass,
  inputClass,
  textareaClass,
} from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import type { ContentStatus, QuoteLang } from "@/lib/db/types";
import { QUOTE_LIMITS } from "@/lib/validation/quote";

export type QuoteEditorInitial = {
  text: string;
  lang: QuoteLang;
  translation: string;
  author: string;
  status: ContentStatus;
  publishAt: string;
  featured: boolean;
};

export const EMPTY_QUOTE: QuoteEditorInitial = {
  text: "",
  lang: "hi",
  translation: "",
  author: "",
  status: "draft",
  publishAt: "",
  featured: false,
};

const LANG_OPTIONS: {
  value: QuoteLang;
  label: string;
  description: string;
}[] = [
  {
    value: "hi",
    label: "हिंदी",
    description: "Shayari or a quote in Hindi",
  },
  {
    value: "en",
    label: "English",
    description: "A quote in English",
  },
];

const TEXT_PLACEHOLDER: Record<QuoteLang, string> = {
  hi: "स्याही ने हर दर्द को लफ़्ज़ दे दिए,\nकाग़ज़ ने चुपचाप सब कुछ सह लिया।",
  en: "Ink dries. The feeling it carried never does.",
};

const TRANSLATION_PLACEHOLDER: Record<QuoteLang, string> = {
  hi: "The ink gave every ache its words,\nand the paper quietly held it all.",
  en: "स्याही सूख जाती है, पर उसका एहसास नहीं।",
};

// Devanagari needs more room between lines than Latin letters
const PREVIEW_TEXT_CLASS: Record<QuoteLang, string> = {
  hi: "text-xl leading-[1.9]",
  en: "text-lg leading-[1.7]",
};

interface QuoteEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: QuoteEditorInitial;
  isNew: boolean;
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

export default function QuoteEditor({
  action,
  initial,
  isNew,
}: QuoteEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();

  const [lang, setLang] = useState<QuoteLang>(initial.lang);
  const [text, setText] = useState(initial.text);
  const [translation, setTranslation] = useState(initial.translation);
  const [author, setAuthor] = useState(initial.author);
  const [publish, setPublish] = useState<PublishValue>({
    status: initial.status,
    publishAt: initial.publishAt,
    featured: initial.featured,
  });

  const errors = state.fieldErrors ?? {};
  const wasPublished = !isNew && initial.status === "published";
  const translationLang: QuoteLang = lang === "hi" ? "en" : "hi";

  const textId = `${id}-text`;
  const translationId = `${id}-translation`;
  const authorId = `${id}-author`;
  const previewId = `${id}-preview`;

  const textHint = `${text.length}/${QUOTE_LIMITS.text}. Press Enter for a new line, line breaks show exactly as typed.`;
  const translationHint =
    lang === "hi"
      ? "Optional. An English meaning shown softly under the shayari."
      : "Optional. A Hindi meaning shown softly under the quote.";
  const authorHint =
    "Optional. Leave empty for your own writing, add a name when quoting someone.";

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <div className="min-w-0 flex flex-col gap-6">
        <div className={cardClass}>
          <fieldset className="flex flex-col gap-3">
            <legend className="pb-3 text-sm font-medium text-foreground">
              Language
            </legend>

            <div className="grid gap-3 sm:grid-cols-2">
              {LANG_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="p-3 flex items-start gap-3 border border-border rounded-lg cursor-pointer transition-colors hover:bg-surface-muted has-checked:bg-surface-muted has-checked:border-accent has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-accent"
                >
                  <input
                    type="radio"
                    name="lang"
                    value={option.value}
                    checked={lang === option.value}
                    onChange={() => setLang(option.value)}
                    className="w-4 h-4 mt-0.5 shrink-0 accent-accent"
                  />

                  <span className="flex flex-col gap-0.5">
                    <span
                      lang={option.value}
                      className="text-sm font-medium text-foreground"
                    >
                      {option.label}
                    </span>
                    <span className="text-xs leading-5 text-muted">
                      {option.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {errors.lang && (
              <p className="text-sm text-red-600">{errors.lang[0]}</p>
            )}
          </fieldset>

          <FormField
            id={textId}
            label="Quote"
            hint={textHint}
            errors={errors.text}
          >
            <textarea
              {...getFieldA11y(textId, errors.text, textHint)}
              name="text"
              lang={lang}
              rows={6}
              value={text}
              maxLength={QUOTE_LIMITS.text}
              onChange={(event) => setText(event.target.value)}
              placeholder={TEXT_PLACEHOLDER[lang]}
              className={textareaClass}
            />
          </FormField>

          <FormField
            id={translationId}
            label="Translation"
            hint={translationHint}
            errors={errors.translation}
          >
            <textarea
              {...getFieldA11y(
                translationId,
                errors.translation,
                translationHint,
              )}
              name="translation"
              lang={translationLang}
              rows={3}
              value={translation}
              maxLength={QUOTE_LIMITS.translation}
              onChange={(event) => setTranslation(event.target.value)}
              placeholder={TRANSLATION_PLACEHOLDER[lang]}
              className={textareaClass}
            />
          </FormField>

          <FormField
            id={authorId}
            label="Author"
            hint={authorHint}
            errors={errors.author}
          >
            <input
              {...getFieldA11y(authorId, errors.author, authorHint)}
              name="author"
              type="text"
              value={author}
              maxLength={QUOTE_LIMITS.author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Mirza Ghalib"
              className={inputClass}
            />
          </FormField>
        </div>

        <section aria-labelledby={previewId} className={cardClass}>
          <h2 id={previewId} className="text-lg font-semibold text-foreground">
            Preview
          </h2>

          <figure className="p-6 sm:p-8 flex flex-col gap-5 bg-background border border-border rounded-lg">
            <span
              aria-hidden="true"
              className="h-6 font-serif text-5xl leading-none text-accent/50"
            >
              “
            </span>

            <p
              lang={lang}
              className={`font-serif whitespace-pre-line text-pretty text-foreground ${PREVIEW_TEXT_CLASS[lang]}`}
            >
              {text.trim() || "Your quote shows here."}
            </p>

            {translation.trim() && (
              <p
                lang={translationLang}
                className="text-sm leading-6 italic whitespace-pre-line text-pretty text-muted"
              >
                {translation.trim()}
              </p>
            )}

            {author.trim() && (
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                {author.trim()}
              </p>
            )}
          </figure>
        </section>
      </div>

      <aside className="flex flex-col gap-6">
        <PublishPanel
          id={id}
          value={publish}
          onChange={(next) => {
            setPublish(next);
            markDirty();
          }}
          errors={errors}
          featuredLabel="Feature at the top of the quotes page"
        >
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
            {isPending ? "Saving" : getSaveLabel(publish.status, wasPublished)}
          </button>

          <FormStatus state={state} />
        </PublishPanel>
      </aside>
    </form>
  );
}
