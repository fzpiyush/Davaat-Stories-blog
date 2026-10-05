/*
 * FormData returns null for missing fields, which breaks string
 * validation. This always gives back strings, empty when missing.
 */
export function readFormText(
  formData: FormData,
  keys: readonly string[],
): Record<string, string> {
  return Object.fromEntries(
    keys.map((key) => {
      const value = formData.get(key);
      return [key, typeof value === "string" ? value : ""];
    }),
  );
}

/* Connects an input to its error or hint text for screen readers */
export function getFieldA11y(id: string, errors?: string[], hint?: string) {
  const hasError = Boolean(errors?.length);

  return {
    id,
    "aria-invalid": hasError ? true : undefined,
    "aria-describedby": hasError
      ? `${id}-error`
      : hint
        ? `${id}-hint`
        : undefined,
  };
}