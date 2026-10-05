export type FieldErrors = Partial<Record<string, string[]>>;
export type FormValues = Record<string, string>;

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: FieldErrors;
  values?: FormValues;
};

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
};

export function successState(message: string): ActionState {
  return { status: "success", message };
}

export function errorState(
  message: string,
  fieldErrors?: FieldErrors,
  values?: FormValues,
): ActionState {
  return { status: "error", message, fieldErrors, values };
}
