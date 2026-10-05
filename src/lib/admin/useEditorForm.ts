"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { initialActionState, type ActionState } from "@/lib/admin/actionState";

type EditorAction = (
  state: ActionState,
  formData: FormData,
) => Promise<ActionState>;

export function useEditorForm(action: EditorAction) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      setIsDirty(false);
      startTransition(() => formAction(formData));
    },
    [formAction],
  );

  return { state, isPending, isDirty, markDirty, handleSubmit };
}
