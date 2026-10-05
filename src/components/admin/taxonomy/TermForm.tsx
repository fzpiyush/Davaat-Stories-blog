"use client";

import { useActionState, useId } from "react";

import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import SubmitButton from "@/components/admin/ui/SubmitButton";
import { initialActionState, type ActionState } from "@/lib/admin/actionState";
import { getFieldA11y } from "@/lib/admin/forms";
import { TAXONOMY, type TaxonomyKind } from "@/lib/admin/taxonomy/config";
import { cardClass, inputClass, textareaClass } from "@/lib/admin/ui";

export type TermFormValues = {
  name: string;
  slug: string;
  description: string;
};

const EMPTY_VALUES: TermFormValues = { name: "", slug: "", description: "" };
const SLUG_HINT = "Used in links. Leave empty to create it from the name.";

interface TermFormProps {
  kind: TaxonomyKind;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  heading: string;
  submitLabel: string;
  pendingLabel: string;
  term?: TermFormValues;
}

export default function TermForm({
  kind,
  action,
  heading,
  submitLabel,
  pendingLabel,
  term,
}: TermFormProps) {
  const [state, formAction] = useActionState(action, initialActionState);
  const id = useId();
  const config = TAXONOMY[kind];

  // Typed values come back on errors, so nothing gets lost
  const values = { ...EMPTY_VALUES, ...term, ...state.values };
  const errors = state.fieldErrors ?? {};

  const nameId = `${id}-name`;
  const slugId = `${id}-slug`;
  const descriptionId = `${id}-description`;

  return (
    <form action={formAction} className={cardClass}>
      <h2 className="text-lg font-semibold text-foreground">{heading}</h2>

      <FormField id={nameId} label="Name" errors={errors.name}>
        <input
          {...getFieldA11y(nameId, errors.name)}
          name="name"
          type="text"
          required
          maxLength={60}
          autoComplete="off"
          defaultValue={values.name}
          placeholder={config.namePlaceholder}
          className={inputClass}
        />
      </FormField>

      <FormField
        id={slugId}
        label="Slug"
        hint={SLUG_HINT}
        errors={errors.slug}
        optional
      >
        <input
          {...getFieldA11y(slugId, errors.slug, SLUG_HINT)}
          name="slug"
          type="text"
          maxLength={120}
          autoComplete="off"
          defaultValue={values.slug}
          placeholder={config.namePlaceholder.toLowerCase()}
          className={inputClass}
        />
      </FormField>

      {config.hasDescription && (
        <FormField
          id={descriptionId}
          label="Description"
          errors={errors.description}
          optional
        >
          <textarea
            {...getFieldA11y(descriptionId, errors.description)}
            name="description"
            rows={3}
            maxLength={300}
            defaultValue={values.description}
            placeholder={`What belongs in this ${config.singular}?`}
            className={textareaClass}
          />
        </FormField>
      )}

      <FormStatus state={state} />

      <div className="flex justify-end">
        <SubmitButton label={submitLabel} pendingLabel={pendingLabel} />
      </div>
    </form>
  );
}
