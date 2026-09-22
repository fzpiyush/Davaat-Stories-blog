"use client";

import { useActionState } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

import { subscribe, type SubscribeState } from "@/lib/newsletter/actions";

const initialState: SubscribeState = {
  status: "idle",
  message: "",
};

export default function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    subscribe,
    initialState,
  );

  const hasError = state.status === "error";

  if (state.status === "success") {
    return (
      <p
        role="status"
        className="w-full max-w-xl flex items-center gap-2 text-sm font-medium text-foreground"
      >
        <CheckCircleIcon aria-hidden="true" className="w-5 h-5 text-accent" />
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-xl flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>

        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email address"
          disabled={isPending}
          aria-invalid={hasError}
          aria-describedby={hasError ? "newsletter-message" : undefined}
          className="w-full min-w-0 h-12 flex-1 px-4 bg-background rounded-lg text-sm text-foreground ring-1 ring-border outline-none placeholder:text-muted focus:ring-2 focus:ring-accent aria-invalid:ring-red-600 disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={isPending}
          className="h-12 inline-flex items-center justify-center gap-2 px-6 bg-accent rounded-lg text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted disabled:opacity-60 disabled:cursor-not-allowed group"
        >
          {isPending ? "Subscribing" : "Subscribe"}
          {!isPending && (
            <ArrowRightIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            />
          )}
        </button>
      </div>

      <p
        id="newsletter-message"
        aria-live="polite"
        className="min-h-5 flex items-center gap-1.5 text-sm text-red-600"
      >
        {hasError && (
          <>
            <ExclamationCircleIcon aria-hidden="true" className="w-4 h-4" />
            {state.message}
          </>
        )}
      </p>
    </form>
  );
}
