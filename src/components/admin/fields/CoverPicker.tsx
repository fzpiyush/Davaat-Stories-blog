"use client";

import Image from "next/image";
import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/outline";

import MediaPickerDialog from "@/components/admin/media/MediaPickerDialog";
import type { CoverValue } from "@/lib/admin/editor";
import { smallButtonClass } from "@/lib/admin/ui";
import type { ImagePresetKey } from "@/lib/media/presets";

interface CoverPickerProps {
  id: string;
  name: string;
  label: string;
  preset: ImagePresetKey;
  value: CoverValue;
  onChange: (next: CoverValue) => void;
  /** A full aspect class like aspect-16/10, so Tailwind can find it */
  aspectClass: string;
  hint?: string;
  errors?: string[];
}

export default function CoverPicker({
  id,
  name,
  label,
  preset,
  value,
  onChange,
  aspectClass,
  hint,
  errors,
}: CoverPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const error = errors?.[0];
  const messageId = `${id}-message`;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{label}</p>

      <div
        className={`w-full ${aspectClass} bg-surface-muted rounded-lg relative overflow-hidden ring-1 ring-border`}
      >
        {value ? (
          <Image
            src={value.url}
            alt={value.alt}
            fill
            sizes="340px"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-sm text-muted">
            <PhotoIcon aria-hidden="true" className="w-8 h-8" />
            No image yet
          </div>
        )}
      </div>

      {(error || hint) && (
        <p
          id={messageId}
          className={
            error ? "text-sm text-red-600" : "text-xs leading-5 text-muted"
          }
        >
          {error ?? hint}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-describedby={error || hint ? messageId : undefined}
          className={smallButtonClass.secondary}
        >
          {value ? "Change" : "Choose image"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={smallButtonClass.danger}
          >
            Remove
          </button>
        )}
      </div>

      <input type="hidden" name={name} value={value?.id ?? ""} />

      {isOpen && (
        <MediaPickerDialog
          title={label}
          preset={preset}
          onSelect={(cover) => {
            onChange(cover);
            setIsOpen(false);
          }}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
