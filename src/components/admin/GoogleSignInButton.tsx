"use client";

import Image from "next/image";
import { useFormStatus } from "react-dom";

export default function GoogleSignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-background border border-border rounded-lg text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-60 disabled:cursor-not-allowed"
    >
      <Image
        src="/google-g.svg"
        alt=""
        width={20}
        height={20}
        className="w-5 h-5"
      />
      {pending ? "Redirecting to Google" : "Continue with Google"}
    </button>
  );
}
