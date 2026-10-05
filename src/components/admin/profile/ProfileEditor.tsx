"use client";

import { useId, useState } from "react";

import CoverPicker from "@/components/admin/fields/CoverPicker";
import FormField from "@/components/admin/ui/FormField";
import FormStatus from "@/components/admin/ui/FormStatus";
import SaveButton from "@/components/admin/ui/SaveButton";
import type { ActionState } from "@/lib/admin/actionState";
import type { CoverValue } from "@/lib/admin/editor";
import { getFieldA11y } from "@/lib/admin/forms";
import { cardClass, inputClass, textareaClass } from "@/lib/admin/ui";
import { useEditorForm } from "@/lib/admin/useEditorForm";
import { PROFILE_LIMITS } from "@/lib/validation/profile";

export type ProfileEditorInitial = {
  name: string;
  slug: string;
  bio: string;
  avatar: CoverValue;
  websiteUrl: string;
  instagramUrl: string;
  xUrl: string;
  linkedinUrl: string;
};

const SOCIAL_FIELDS = [
  { name: "websiteUrl", label: "Website", placeholder: "https://yoursite.com" },
  {
    name: "instagramUrl",
    label: "Instagram",
    placeholder: "https://instagram.com/yourname",
  },
  { name: "xUrl", label: "X", placeholder: "https://x.com/yourname" },
  {
    name: "linkedinUrl",
    label: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourname",
  },
] as const;

interface ProfileEditorProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  initial: ProfileEditorInitial;
}

export default function ProfileEditor({ action, initial }: ProfileEditorProps) {
  const { state, isPending, markDirty, handleSubmit } = useEditorForm(action);
  const id = useId();

  const [bio, setBio] = useState(initial.bio);
  const [avatar, setAvatar] = useState<CoverValue>(initial.avatar);

  const errors = state.fieldErrors ?? {};
  const nameId = `${id}-name`;
  const slugId = `${id}-slug`;
  const bioId = `${id}-bio`;
  const slugHint = "Used for your author page link, which comes later.";
  const bioHint = `${bio.length}/${PROFILE_LIMITS.bio}. Shows in the Written by card under every post.`;

  return (
    <form
      onSubmit={handleSubmit}
      onChange={markDirty}
      className="w-full grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start"
    >
      <div className="min-w-0 flex flex-col gap-6">
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-foreground">About you</h2>

          <FormField id={nameId} label="Name" errors={errors.name}>
            <input
              {...getFieldA11y(nameId, errors.name)}
              name="name"
              type="text"
              required
              maxLength={PROFILE_LIMITS.name}
              defaultValue={initial.name}
              autoComplete="name"
              className={inputClass}
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
              maxLength={120}
              defaultValue={initial.slug}
              autoComplete="off"
              className={inputClass}
            />
          </FormField>

          <FormField id={bioId} label="Bio" hint={bioHint} errors={errors.bio}>
            <textarea
              {...getFieldA11y(bioId, errors.bio, bioHint)}
              name="bio"
              rows={5}
              value={bio}
              maxLength={PROFILE_LIMITS.bio}
              onChange={(event) => setBio(event.target.value)}
              placeholder="Writing about technology, life, ideas, and the lessons I learn along the way."
              className={textareaClass}
            />
          </FormField>
        </div>

        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-foreground">Links</h2>

          <div className="grid gap-5 md:grid-cols-2">
            {SOCIAL_FIELDS.map((field) => {
              const fieldId = `${id}-${field.name}`;
              const fieldErrors = errors[field.name];

              return (
                <FormField
                  key={field.name}
                  id={fieldId}
                  label={field.label}
                  errors={fieldErrors}
                  optional
                >
                  <input
                    {...getFieldA11y(fieldId, fieldErrors)}
                    name={field.name}
                    type="url"
                    inputMode="url"
                    maxLength={500}
                    defaultValue={initial[field.name]}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                </FormField>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-6">
        <div className={cardClass}>
          <CoverPicker
            id={`${id}-avatar`}
            name="avatarMediaId"
            label="Photo"
            preset="avatar"
            value={avatar}
            onChange={(next) => {
              setAvatar(next);
              markDirty();
            }}
            aspectClass="aspect-square"
            hint="Square photos work best. Others get cropped from the center."
            errors={errors.avatarMediaId}
          />
        </div>

        <div className={`${cardClass} *:w-full`}>
          <SaveButton isPending={isPending} label="Save profile" />
          <FormStatus state={state} />
        </div>
      </aside>
    </form>
  );
}
