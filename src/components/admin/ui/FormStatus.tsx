"use client";

import { useEffect } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

import { useToast } from "@/components/admin/ui/Toaster";
import type { ActionState } from "@/lib/admin/actionState";

interface FormStatusProps {
  state: ActionState;
}

const announced = new WeakSet<ActionState>();

export default function FormStatus({ state }: FormStatusProps) {
  const toast = useToast();

  useEffect(() => {
    if (state.status !== "success" || !state.message) {
      return;
    }

    if (announced.has(state)) {
      return;
    }

    announced.add(state);
    toast.success(state.message);
  }, [state, toast]);

  if (state.status !== "error" || !state.message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="p-3 flex items-start gap-2 text-sm text-red-600 bg-red-600/10 border border-red-600/20 rounded-lg"
    >
      <ExclamationCircleIcon aria-hidden="true" className="w-5 h-5 shrink-0" />
      {state.message}
    </p>
  );
}
