import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

import type { ActionState } from "@/lib/admin/actionState";

interface FormStatusProps {
  state: ActionState;
}

export default function FormStatus({ state }: FormStatusProps) {
  if (state.status === "idle" || !state.message) {
    return null;
  }

  if (state.status === "error") {
    return (
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
    );
  }

  return (
    <p
      role="status"
      className="p-3 flex items-start gap-2 text-sm text-foreground bg-surface-muted border border-border rounded-lg"
    >
      <CheckCircleIcon
        aria-hidden="true"
        className="w-5 h-5 shrink-0 text-accent"
      />
      {state.message}
    </p>
  );
}
