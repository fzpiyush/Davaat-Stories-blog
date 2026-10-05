"use client";

import { useState, type KeyboardEvent } from "react";
import { PlusIcon, XMarkIcon } from "@heroicons/react/20/solid";

import { getFieldA11y } from "@/lib/admin/forms";
import { inputClass } from "@/lib/admin/ui";

const MAX_SUGGESTIONS = 6;

interface TagInputProps {
  id: string;
  name: string;
  value: string[];
  onChange: (next: string[]) => void;
  suggestions: string[];
  max: number;
  maxLength: number;
  hint?: string;
  errors?: string[];
}

export default function TagInput({
  id,
  name,
  value,
  onChange,
  suggestions,
  max,
  maxLength,
  hint,
  errors,
}: TagInputProps) {
  const [draft, setDraft] = useState("");

  const selected = new Set(value.map((tag) => tag.toLowerCase()));
  const search = draft.trim().toLowerCase();
  const isFull = value.length >= max;

  const matches = search
    ? suggestions
        .filter(
          (suggestion) =>
            !selected.has(suggestion.toLowerCase()) &&
            suggestion.toLowerCase().includes(search),
        )
        .slice(0, MAX_SUGGESTIONS)
    : [];

  function addTag(raw: string) {
    const cleaned = raw.trim().replace(/\s+/g, " ").slice(0, maxLength);
    setDraft("");

    if (!cleaned || isFull) {
      return;
    }

    // Reuses the existing spelling, so technology becomes Technology
    const existing = suggestions.find(
      (suggestion) => suggestion.toLowerCase() === cleaned.toLowerCase(),
    );
    const tag = existing ?? cleaned;

    if (!selected.has(tag.toLowerCase())) {
      onChange([...value, tag]);
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
      return;
    }

    if (event.key === "Backspace" && !draft && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <li
              key={tag}
              className="pl-3 pr-1 py-1 inline-flex items-center gap-1 text-xs text-foreground bg-surface-muted rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="w-5 h-5 flex items-center justify-center text-muted rounded-full transition-colors hover:text-foreground hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <XMarkIcon aria-hidden="true" className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        {...getFieldA11y(id, errors, hint)}
        type="text"
        value={draft}
        disabled={isFull}
        autoComplete="off"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          isFull ? `Up to ${max} tags` : "Type a tag and press Enter"
        }
        className={inputClass}
      />

      {matches.length > 0 && (
        <ul aria-label="Matching tags" className="flex flex-wrap gap-2">
          {matches.map((match) => (
            <li key={match}>
              <button
                type="button"
                onClick={() => addTag(match)}
                className="px-3 py-1 inline-flex items-center gap-1 text-xs text-muted bg-background border border-border rounded-full transition-colors hover:text-foreground hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <PlusIcon aria-hidden="true" className="w-3.5 h-3.5" />
                {match}
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
    </div>
  );
}
