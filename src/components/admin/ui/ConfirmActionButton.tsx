"use client";

import {
  useActionState,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import {
  ArrowPathIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

import { useToast } from "@/components/admin/ui/Toaster";
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
  /** Heading inside the modal, defaults to the button label */
  confirmTitle?: string;
  /** Text on the modal's confirm button, defaults to the button label */
  confirmLabel?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When set, the button is disabled and this explains why */
  disabledReason?: string;
}

const sizeClass: Record<ButtonSize, Record<ButtonVariant, string>> = {
  medium: buttonClass,
  small: smallButtonClass,
};

const confirmButtonClass: Record<ButtonVariant, string> = {
  primary: buttonClass.primary,
  secondary: buttonClass.primary,
  danger: buttonClass.danger,
};

const iconWrapClass: Record<ButtonVariant, string> = {
  primary:
    "w-10 h-10 flex shrink-0 items-center justify-center text-accent bg-surface-muted rounded-full",
  secondary:
    "w-10 h-10 flex shrink-0 items-center justify-center text-accent bg-surface-muted rounded-full",
  danger:
    "w-10 h-10 flex shrink-0 items-center justify-center text-red-600 bg-red-600/10 rounded-full",
};

export default function ConfirmActionButton({
  action,
  label,
  pendingLabel,
  confirmMessage,
  confirmTitle,
  confirmLabel,
  variant = "danger",
  size = "medium",
  disabledReason,
}: ConfirmActionButtonProps) {
  const toast = useToast();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const messageId = useId();
  const [errorVisible, setErrorVisible] = useState(false);

  // The toast fires here rather than in an effect, because a successful
  // delete often removes this button from the page straight away.
  const [state, formAction, isPending] = useActionState(
    async (previous: ActionState, formData: FormData) => {
      const result = await action(previous, formData);

      if (result.status === "success") {
        toast.success(result.message || "Done");
      }

      return result;
    },
    initialActionState,
  );

  useEffect(() => {
    if (state.status === "success") {
      dialogRef.current?.close();
    }
  }, [state]);

  function openDialog() {
    setErrorVisible(false);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!isPending) {
      dialogRef.current?.close();
    }
  }

  function handleCancel(event: SyntheticEvent<HTMLDialogElement>) {
    if (isPending) {
      event.preventDefault();
    }
  }

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={() => setErrorVisible(true)}
      className="flex flex-col items-start sm:items-end gap-1.5"
    >
      <button
        type="button"
        onClick={openDialog}
        disabled={isPending || Boolean(disabledReason)}
        aria-haspopup="dialog"
        title={disabledReason}
        className={sizeClass[size][variant]}
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onCancel={handleCancel}
        onClick={handleBackdropClick}
        className="w-[calc(100%-2rem)] max-w-md m-auto p-0 text-foreground bg-surface shadow-xl border border-border rounded-xl backdrop:bg-background/20 backdrop:backdrop-blur-sm"
      >
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-start gap-4">
            <span className={iconWrapClass[variant]}>
              <ExclamationTriangleIcon aria-hidden="true" className="w-5 h-5" />
            </span>

            <div className="min-w-0 flex flex-col gap-1.5">
              <h2 id={titleId} className="font-serif text-lg text-foreground">
                {confirmTitle ?? label}
              </h2>
              <p id={messageId} className="text-sm leading-6 text-muted">
                {confirmMessage}
              </p>
            </div>
          </div>

          {errorVisible && state.status === "error" && state.message && (
            <p
              role="alert"
              className="p-3 flex items-start gap-2 text-sm text-red-600 bg-red-600/10 border border-red-600/20 rounded-lg"
            >
              <ExclamationCircleIcon
                aria-hidden="true"
                className="w-5 h-5 shrink-0"
              />
              {state.message}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={closeDialog}
              disabled={isPending}
              className={buttonClass.secondary}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              aria-busy={isPending}
              className={confirmButtonClass[variant]}
            >
              {isPending && (
                <ArrowPathIcon
                  aria-hidden="true"
                  className="w-4 h-4 shrink-0 animate-spin motion-reduce:animate-none"
                />
              )}
              {isPending ? pendingLabel : (confirmLabel ?? label)}
            </button>
          </div>
        </div>
      </dialog>
    </form>
  );
}
