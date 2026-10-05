"use client";

import { useFormStatus } from "react-dom";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { buttonClass, type ButtonVariant } from "@/lib/admin/ui";

interface SubmitButtonProps {
  label: string;
  pendingLabel: string;
  variant?: ButtonVariant;
}

export default function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={buttonClass[variant]}
    >
      {pending && (
        <ArrowPathIcon
          aria-hidden="true"
          className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
        />
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}
