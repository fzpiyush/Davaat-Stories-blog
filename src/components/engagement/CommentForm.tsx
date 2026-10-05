"use client";

import { useId, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { COMMENT_MAX_LENGTH } from "@/lib/engagement/signIn";
import type { ActionResult } from "@/lib/engagement/types";

const textareaClass =
  "w-full min-h-24 px-4 py-3 text-sm leading-6 text-foreground bg-background rounded-lg ring-1 ring-border outline-none resize-y placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600 disabled:opacity-60";

const submitClass =
  "px-5 py-2.5 inline-flex items-center gap-2 text-sm font-medium text-accent-foreground bg-accent rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed";

const cancelClass =
  "px-4 py-2.5 text-sm font-medium text-muted rounded-lg transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent";

interface CommentFormProps {
  label: string;
  submitLabel: string;
  placeholder: string;
  initialBody?: string;
  autoFocus?: boolean;
  onSubmit: (body: string) => Promise<ActionResult>;
  onCancel?: () => void;
  onDone?: () => void;
}

export default function CommentForm({
  label,
  submitLabel,
  placeholder,
  initialBody = "",
  autoFocus = false,
  onSubmit,
  onCancel,
  onDone,
}: CommentFormProps) {
  const id = useId();
  const [body, setBody] = useState(initialBody);
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const remaining = COMMENT_MAX_LENGTH - body.length;
  const errorId = `${id}-error`;

  async function submit() {
    if (isPending || !body.trim()) {
      return;
    }

    setIsPending(true);
    setError("");

    const result = await onSubmit(body);
    setIsPending(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setBody("");
    onDone?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      void submit();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <textarea
        id={id}
        value={body}
        rows={3}
        maxLength={COMMENT_MAX_LENGTH}
        autoFocus={autoFocus}
        disabled={isPending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={(event) => setBody(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={textareaClass}
      />

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span
          className={`text-xs ${remaining < 100 ? "text-accent" : "text-muted"}`}
        >
          {remaining < 300 ? `${remaining} characters left` : ""}
        </span>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button type="button" onClick={onCancel} className={cancelClass}>
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={isPending || !body.trim()}
            aria-busy={isPending}
            className={submitClass}
          >
            {isPending && (
              <ArrowPathIcon
                aria-hidden="true"
                className="w-4 h-4 animate-spin motion-reduce:animate-none"
              />
            )}
            {isPending ? "Posting" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
