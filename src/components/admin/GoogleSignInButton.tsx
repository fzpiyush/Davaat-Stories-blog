"use client";

import { useFormStatus } from "react-dom";
import {
  ArrowPathIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/20/solid";

export default function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full h-12 px-4 flex items-center justify-center gap-3 text-sm font-medium text-foreground bg-background shadow-sm border border-border rounded-lg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60 disabled:cursor-not-allowed group"
    >
      {pending ? (
        <ArrowPathIcon
          aria-hidden="true"
          className="w-5 h-5 shrink-0 text-accent animate-spin motion-reduce:animate-none"
        />
      ) : (
        <ArrowRightEndOnRectangleIcon
          aria-hidden="true"
          className="w-5 h-5 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      )}
      {pending ? "Redirecting to Google" : "Continue with Google"}
    </button>
  );
}
