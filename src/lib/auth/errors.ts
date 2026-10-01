export type LoginErrorCode =
  | "state_mismatch"
  | "not_allowed"
  | "oauth_failed"
  | "cancelled";

const LOGIN_ERROR_MESSAGES: Record<LoginErrorCode, string> = {
  state_mismatch: "Your sign in session expired. Please try again.",
  not_allowed: "This Google account doesn't have admin access.",
  oauth_failed: "Google sign in failed. Please try again.",
  cancelled: "Sign in was cancelled.",
};

function isLoginErrorCode(value: string): value is LoginErrorCode {
  return value in LOGIN_ERROR_MESSAGES;
}

export function getLoginErrorMessage(
  value: string | string[] | undefined,
): string | null {
  const code = Array.isArray(value) ? value[0] : value;

  if (!code) {
    return null;
  }

  return isLoginErrorCode(code)
    ? LOGIN_ERROR_MESSAGES[code]
    : LOGIN_ERROR_MESSAGES.oauth_failed;
}
