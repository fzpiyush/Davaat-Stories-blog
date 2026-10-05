"use client";

import { useActionState, type FormEvent } from "react";
import { ArrowPathIcon } from "@heroicons/react/20/solid";

import { initialActionState, type ActionState } from "@/lib/admin/actionState";
import {
  buttonClass,
  smallButtonClass,
  type ButtonVariant,
} from "@/lib/admin/ui";

type ButtonSize = "medium" | "small";

interface ConfirmActionButtonProps {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
  pendingLabel: string;
  confirmMessage: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When set, the button is disabled and this explains why */
  disabledReason?: string;
}

const sizeClass: Record<ButtonSize, Record<ButtonVariant, string>> = {
  medium: buttonClass,
  small: smallButtonClass,
};

export default function ConfirmActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
  variant = "danger",
  size = "medium",
  disabledReason,
}: ConfirmActionButtonProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="flex flex-col items-start sm:items-end gap-1.5"
    >
      <button
        type="submit"
        disabled={isPending || Boolean(disabledReason)}
        aria-busy={isPending}
        title={disabledReason}
        className={sizeClass[size][variant]}
      >
        {isPending && (
          <ArrowPathIcon
            aria-hidden="true"
            className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
          />
        )}
        {isPending ? pendingLabel : label}
      </button>

      {state.status === "error" && (
        <p
          role="alert"
          className="max-w-64 text-xs leading-5 text-red-600 sm:text-right"
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
