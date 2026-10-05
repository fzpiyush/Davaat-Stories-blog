import type { ReactNode } from "react";
import { ExclamationCircleIcon } from "@heroicons/react/20/solid";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  errors?: string[];
  optional?: boolean;
  children: ReactNode;
}

export default function FormField({
  id,
  label,
  hint,
  errors,
  optional = false,
  children,
}: FormFieldProps) {
  const error = errors?.[0];

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm font-medium text-foreground"
      >
        {label}
        {optional && (
          <span className="text-xs font-normal text-muted">Optional</span>
        )}
      </label>

      {children}

      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-start gap-1.5 text-sm text-red-600"
        >
          <ExclamationCircleIcon
            aria-hidden="true"
            className="w-4 h-4 mt-0.5 shrink-0"
          />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs leading-5 text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
